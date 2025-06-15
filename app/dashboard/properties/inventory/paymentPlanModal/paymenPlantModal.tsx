"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Calendar, Percent, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface PaymentFieldSet {
  id: string
  date: string
  constructionPercent: number
  amount: number
}

interface PaymentPlanModalProps {
  isOpen: boolean
  onClose: () => void
  type: string | null
  rowId: string | null
  editPlan?: any
  onPaymentPlanSave: (data: any) => void
}

export default function PaymentPlanModal({
  isOpen,
  onClose,
  type,
  rowId,
  editPlan,
  onPaymentPlanSave,
}: PaymentPlanModalProps) {
  const [fieldSets, setFieldSets] = useState<PaymentFieldSet[]>([
    {
      id: "1",
      date: "",
      constructionPercent: 0,
      amount: 0,
    },
  ])

  // Add useEffect to populate data when editPlan is provided
  useEffect(() => {
    if (editPlan && Array.isArray(editPlan) && editPlan.length > 0) {
      const mappedFieldSets = editPlan.map((plan: any, index: number) => ({
        id: (index + 1).toString(),
        date: plan.date || "",
        constructionPercent: plan.constructionPercent || 0,
        amount: plan.amount || 0,
      }))
      setFieldSets(mappedFieldSets)
    } else {
      setFieldSets([
        {
          id: "1",
          date: "",
          constructionPercent: 0,
          amount: 0,
        },
      ])
    }
  }, [editPlan])

  const addFieldSet = () => {
    const newFieldSet: PaymentFieldSet = {
      id: Date.now().toString(),
      date: "",
      constructionPercent: 0,
      amount: 0,
    }
    setFieldSets([...fieldSets, newFieldSet])
  }

  const removeFieldSet = (fieldSetId: string) => {
    if (fieldSets.length > 1) {
      setFieldSets(fieldSets.filter((fs) => fs.id !== fieldSetId))
    }
  }

  const updateFieldSet = (fieldSetId: string, field: keyof PaymentFieldSet, value: string | number) => {
    setFieldSets(fieldSets.map((fs) => (fs.id === fieldSetId ? { ...fs, [field]: value } : fs)))
  }

  const handleSave = () => {
    const validFieldSets = fieldSets.filter((fs) => fs.date && fs.constructionPercent > 0 && fs.amount > 0)

    if (validFieldSets.length === 0) {
      alert("Please add at least one valid field set with date, construction percent, and amount.")
      return
    }

    const totalPercent = validFieldSets.reduce((sum, fs) => sum + (fs.constructionPercent || 0), 0)

    if (totalPercent > 100) {
      alert("Total construction percentage cannot exceed 100%.")
      return
    }

    const paymentPlanData = {
      docId: rowId,
      type: type,
      data: validFieldSets.map((fs) => ({
        date: fs.date,
        constructionPercent: fs.constructionPercent,
        amount: fs.amount,
      })),
    }

    onPaymentPlanSave(paymentPlanData)
  }

  const handleClose = () => {
    setFieldSets([
      {
        id: "1",
        date: "",
        constructionPercent: 0,
        amount: 0,
      },
    ])
    onClose()
  }

  const totalPercent = fieldSets.reduce((sum, fs) => sum + (fs.constructionPercent || 0), 0)
  const totalAmount = fieldSets.reduce((sum, fs) => sum + (fs.amount || 0), 0)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-purple-600" />
            Add Payment Plan
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Create payment plan with dates, construction percentages, and amounts for property ID:{" "}
            {rowId?.substring(0, 8)}...
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Fields</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold">{fieldSets.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Construction %</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">{totalPercent}%</div>
                  {totalPercent > 100 && (
                    <Badge variant="destructive" className="text-xs">
                      Exceeds 100%
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold">${totalAmount.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Fields */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Payment Fields</h3>
              <Button onClick={addFieldSet} variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Field
              </Button>
            </div>

            <Card>
              <CardContent className="space-y-6 pt-6">
                {fieldSets.map((fieldSet, fieldIndex) => (
                  <div key={fieldSet.id} className="space-y-4">
                    {/* Field Set Header */}
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-muted-foreground">Field Set {fieldIndex + 1}</h4>
                      {fieldSets.length > 1 && (
                        <Button
                          onClick={() => removeFieldSet(fieldSet.id)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    {/* Field Set Content */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      {/* Date */}
                      <div className="space-y-2">
                        <Label htmlFor={`date-${fieldSet.id}`} className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          Payment Date
                        </Label>
                        <Input
                          id={`date-${fieldSet.id}`}
                          type="date"
                          value={fieldSet.date}
                          onChange={(e) => updateFieldSet(fieldSet.id, "date", e.target.value)}
                          className="w-full"
                        />
                      </div>

                      {/* Construction Percentage */}
                      <div className="space-y-2">
                        <Label htmlFor={`constructionPercent-${fieldSet.id}`} className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-green-500" />
                          Construction %
                        </Label>
                        <div className="relative">
                          <Input
                            id={`constructionPercent-${fieldSet.id}`}
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={fieldSet.constructionPercent || ""}
                            onChange={(e) =>
                              updateFieldSet(fieldSet.id, "constructionPercent", Number.parseFloat(e.target.value) || 0)
                            }
                            className="pr-8"
                            placeholder="0"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            %
                          </span>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="space-y-2">
                        <Label htmlFor={`amount-${fieldSet.id}`} className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-purple-500" />
                          Amount
                        </Label>
                        <div className="relative">
                          <Input
                            id={`amount-${fieldSet.id}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={fieldSet.amount || ""}
                            onChange={(e) =>
                              updateFieldSet(fieldSet.id, "amount", Number.parseFloat(e.target.value) || 0)
                            }
                            className="pl-8"
                            placeholder="0.00"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            $
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Field Set Summary */}
                    {fieldSet.date && fieldSet.constructionPercent > 0 && fieldSet.amount > 0 && (
                      <div className="ml-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300">
                        <strong>Summary:</strong> Pay ${fieldSet.amount.toLocaleString()} (
                        {fieldSet.constructionPercent}% construction) on {new Date(fieldSet.date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between pt-6">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                totalPercent > 100 || fieldSets.every((fs) => !fs.date || fs.constructionPercent <= 0 || fs.amount <= 0)
              }
              className="bg-purple-600 hover:bg-purple-700"
            >
              Save Payment Plan
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
