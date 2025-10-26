"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pie, PieChart, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Transaction, Category } from "@/lib/types"

interface TransactionWithCategory extends Transaction {
  category: Category
}

interface CategoryChartProps {
  transactions: TransactionWithCategory[]
  categories: Category[]
}

interface ChartDataItem {
  id: string
  name: string
  value: number
  color: string
  hasChildren: boolean
}

interface BreadcrumbItem {
  id: string | null
  name: string
}

export function CategoryChart({ transactions, categories }: CategoryChartProps) {
  const [currentParentId, setCurrentParentId] = useState<string | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: null, name: "All Categories" }])

  // Build category hierarchy helpers
  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>()
    categories.forEach(cat => map.set(cat.id, cat))
    return map
  }, [categories])

  const getChildren = (parentId: string | null): Category[] => {
    return categories.filter(cat => cat.parent_id === parentId)
  }

  // Helper function to generate color variations
  const generateColorVariation = (baseColor: string, variation: number): string => {
    // Convert hex to HSL, modify lightness/saturation, convert back
    const hex = baseColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16) / 255
    const g = parseInt(hex.substr(2, 2), 16) / 255
    const b = parseInt(hex.substr(4, 2), 16) / 255
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2
    
    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }
    
    // Create variations by adjusting hue and lightness
    const hueShift = (variation * 30) % 360 // Shift hue by 30 degrees per variation
    const lightnessAdjust = variation % 2 === 0 ? 0.1 : -0.1 // Alternate lighter/darker
    
    const newH = (h * 360 + hueShift) % 360 / 360
    const newL = Math.max(0.2, Math.min(0.8, l + lightnessAdjust))
    
    // Convert HSL back to RGB
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    
    let newR: number, newG: number, newB: number
    
    if (s === 0) {
      newR = newG = newB = newL
    } else {
      const q = newL < 0.5 ? newL * (1 + s) : newL + s - newL * s
      const p = 2 * newL - q
      newR = hue2rgb(p, q, newH + 1/3)
      newG = hue2rgb(p, q, newH)
      newB = hue2rgb(p, q, newH - 1/3)
    }
    
    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }
    
    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`
  }

  // Calculate expenses by category at current level
  const chartData = useMemo(() => {
    const expenseTransactions = transactions.filter(t => t.type === "expense")
    const expensesByCategory = new Map<string, ChartDataItem>()

    expenseTransactions.forEach(transaction => {
      const category = categoryMap.get(transaction.category_id)
      if (!category) return

      let targetCategoryId: string | undefined
      let targetCategory: Category | undefined

      if (currentParentId === null) {
        // At root level, find the top-level parent category
        targetCategory = category
        while (targetCategory.parent_id) {
          const parent = categoryMap.get(targetCategory.parent_id)
          if (parent) {
            targetCategory = parent
          } else {
            break
          }
        }
        targetCategoryId = targetCategory.id
      } else {
        // At a specific level, check if transaction category is a direct child or descendant
        if (category.parent_id === currentParentId) {
          // Direct child
          targetCategoryId = category.id
          targetCategory = category
        } else {
          // Check if it's a descendant - find the direct child of currentParentId
          let checkCategory = category
          let directChild: Category | undefined
          
          while (checkCategory.parent_id) {
            const parent = categoryMap.get(checkCategory.parent_id)
            if (!parent) break
            
            if (parent.id === currentParentId) {
              // Found the direct child
              directChild = checkCategory
              break
            }
            checkCategory = parent
          }
          
          if (directChild) {
            targetCategoryId = directChild.id
            targetCategory = directChild
          }
        }
      }

      if (!targetCategoryId || !targetCategory) return

      if (!expensesByCategory.has(targetCategoryId)) {
        const hasChildren = getChildren(targetCategoryId).length > 0
        expensesByCategory.set(targetCategoryId, {
          id: targetCategoryId,
          name: targetCategory.name,
          value: 0,
          color: targetCategory.color || "#6b7280",
          hasChildren
        })
      }

      const existing = expensesByCategory.get(targetCategoryId)!
      existing.value += Number(transaction.amount)
    })

    // Convert to array and handle duplicate colors
    const dataArray = Array.from(expensesByCategory.values()).map(data => ({
      ...data,
      value: Number(data.value.toFixed(2))
    }))

    // Generate distinct colors for duplicate colors
    const generateDistinctColors = (items: ChartDataItem[]): ChartDataItem[] => {
      const colorMap = new Map<string, number>()
      
      return items.map((item, index) => {
        const baseColor = item.color
        const colorCount = colorMap.get(baseColor) || 0
        colorMap.set(baseColor, colorCount + 1)
        
        if (colorCount === 0) {
          // First occurrence, keep original color
          return item
        } else {
          // Generate a variation of the original color
          const distinctColor = generateColorVariation(baseColor, colorCount)
          return { ...item, color: distinctColor }
        }
      })
    }
    
    return generateDistinctColors(dataArray)
  }, [transactions, categories, currentParentId, categoryMap])

  const handleCategoryClick = (data: ChartDataItem) => {
    if (data.hasChildren) {
      setCurrentParentId(data.id)
      const newBreadcrumb = { id: data.id, name: data.name }
      setBreadcrumbs(prev => [...prev, newBreadcrumb])
    }
  }

  const handleBreadcrumbClick = (index: number) => {
    const targetBreadcrumb = breadcrumbs[index]
    setCurrentParentId(targetBreadcrumb.id)
    setBreadcrumbs(prev => prev.slice(0, index + 1))
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const total = chartData.reduce((sum, item) => sum + item.value, 0)
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0
      
      return (
        <div className="bg-card border border-border rounded-md p-3 shadow-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            ${data.value.toFixed(2)} ({percentage}%)
          </p>
          {data.hasChildren && (
            <p className="text-xs text-blue-600">Click to drill down</p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Expenses by Category</span>
          {breadcrumbs.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBreadcrumbClick(breadcrumbs.length - 2)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          <div className="flex items-center gap-1 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.id || 'root'} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                <button
                  onClick={() => handleBreadcrumbClick(index)}
                  className="text-blue-600 hover:underline focus:outline-none"
                  disabled={index === breadcrumbs.length - 1}
                >
                  {crumb.name}
                </button>
              </div>
            ))}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie 
                  data={chartData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={140}
                  onClick={(data) => handleCategoryClick(data)}
                  cursor="pointer"
                  labelLine={false}
                  label={false} // Disable overlapping labels
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke={entry.hasChildren ? "#3b82f6" : "transparent"}
                      strokeWidth={entry.hasChildren ? 2 : 0}
                      style={{ 
                        cursor: entry.hasChildren ? "pointer" : "default",
                        filter: entry.hasChildren ? "brightness(1.1)" : "none"
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Category List with Values */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">Category Breakdown</h4>
              {(() => {
                const originalColors = new Set()
                const hasColorDuplicates = chartData.some(item => {
                  const originalColor = categories.find(c => c.id === item.id)?.color || "#6b7280"
                  if (originalColors.has(originalColor)) {
                    return true
                  }
                  originalColors.add(originalColor)
                  return false
                })

                return (
                  <>
                    {hasColorDuplicates && (
                      <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                        <p className="text-xs text-blue-800 dark:text-blue-200">
                          💡 Colors have been automatically adjusted to make categories with the same color distinguishable
                        </p>
                      </div>
                    )}
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {(() => {
                        const total = chartData.reduce((sum, item) => sum + item.value, 0)
                        return chartData
                          .sort((a, b) => b.value - a.value) // Sort by value descending
                          .map((item) => {
                            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0
                            const originalCategory = categories.find(c => c.id === item.id)
                            const originalColor = originalCategory?.color || "#6b7280"
                            const colorWasAdjusted = item.color !== originalColor
                            
                            return (
                              <div
                                key={item.id}
                                className={`flex items-center justify-between p-3 rounded-md border transition-colors ${
                                  item.hasChildren 
                                    ? "cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/20 border-blue-200 dark:border-blue-800" 
                                    : "border-gray-200 dark:border-gray-700"
                                }`}
                                onClick={() => item.hasChildren && handleCategoryClick(item)}
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <div className="flex items-center gap-1">
                                    <div 
                                      className="w-3 h-3 rounded-sm flex-shrink-0" 
                                      style={{ backgroundColor: item.color }}
                                    />
                                    {colorWasAdjusted && (
                                      <div 
                                        className="w-2 h-2 rounded-full border border-gray-400 flex-shrink-0" 
                                        style={{ backgroundColor: originalColor }}
                                        title="Original color (adjusted for visibility)"
                                      />
                                    )}
                                  </div>
                                  <span className="text-sm font-medium truncate">
                                    {item.name}
                                  </span>
                                  {item.hasChildren && (
                                    <ChevronRight className="w-3 h-3 text-blue-600 flex-shrink-0" />
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium">
                                    ${item.value.toFixed(2)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {percentage}%
                                  </div>
                                </div>
                              </div>
                            )
                          })
                      })()}
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        ) : (
          <div className="flex h-[400px] items-center justify-center text-muted-foreground">
            No expense data for this month
          </div>
        )}
        
        {chartData.some(item => item.hasChildren) && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 Click on categories with blue borders to see subcategories
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
