"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Calendar, Percent, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PaymentFieldSet {
  id: string;
  date: string;
  percentage: number;
  amount: number;
}

interface PaymentPlan {
  id: string;
  fieldSets: PaymentFieldSet[];
}

interface PaymentPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  rowId: string | null;
  onPaymentPlanSave: (data: any) => void;
}

export default function PaymentPlanModal({
  isOpen,
  onClose,
  rowId,
  onPaymentPlanSave,
}: PaymentPlanModalProps) {
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([
    {
      id: "1",
      fieldSets: [
        {
          id: "1-1",
          date: "",
          percentage: 0,
          amount: 0,
        },
      ],
    },
  ]);

  const addFieldSet = (planId: string) => {
    const newFieldSet: PaymentFieldSet = {
      id: `${planId}-${Date.now()}`,
      date: "",
      percentage: 0,
      amount: 0,
    };

    setPaymentPlans(
      paymentPlans.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              fieldSets: [...plan.fieldSets, newFieldSet],
            }
          : plan
      )
    );
  };

  const removeFieldSet = (planId: string, fieldSetId: string) => {
    setPaymentPlans(
      paymentPlans.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              fieldSets:
                plan.fieldSets.length > 1
                  ? plan.fieldSets.filter((fs) => fs.id !== fieldSetId)
                  : plan.fieldSets,
            }
          : plan
      )
    );
  };

  const updateFieldSet = (
    planId: string,
    fieldSetId: string,
    field: keyof PaymentFieldSet,
    value: string | number
  ) => {
    setPaymentPlans(
      paymentPlans.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              fieldSets: plan.fieldSets.map((fs) =>
                fs.id === fieldSetId ? { ...fs, [field]: value } : fs
              ),
            }
          : plan
      )
    );
  };

  const addPaymentPlan = () => {
    const newPlan: PaymentPlan = {
      id: Date.now().toString(),
      fieldSets: [
        {
          id: `${Date.now()}-1`,
          date: "",
          percentage: 0,
          amount: 0,
        },
      ],
    };
    setPaymentPlans([...paymentPlans, newPlan]);
  };

  const removePaymentPlan = (id: string) => {
    if (paymentPlans.length > 1) {
      setPaymentPlans(paymentPlans.filter((plan) => plan.id !== id));
    }
  };

  const handleSave = () => {
    const validPlans = paymentPlans.filter((plan) =>
      plan.fieldSets.some((fs) => fs.date && fs.percentage > 0 && fs.amount > 0)
    );

    if (validPlans.length === 0) {
      alert(
        "Please add at least one valid payment plan with date, percentage, and amount."
      );
      return;
    }

    // Calculate totals from all field sets across all plans
    const allFieldSets = paymentPlans.flatMap((plan) => plan.fieldSets);
    const totalPercentage = allFieldSets.reduce(
      (sum, fs) => sum + (fs.percentage || 0),
      0
    );
    const totalAmount = allFieldSets.reduce(
      (sum, fs) => sum + (fs.amount || 0),
      0
    );

    if (totalPercentage > 100) {
      alert("Total percentage cannot exceed 100%.");
      return;
    }

    const paymentPlanData = {
      rowId,
      paymentPlans: validPlans,
      totalPercentage,
      totalAmount,
    };

    onPaymentPlanSave(paymentPlanData);
  };

  const handleClose = () => {
    setPaymentPlans([
      {
        id: "1",
        fieldSets: [
          {
            id: "1-1",
            date: "",
            percentage: 0,
            amount: 0,
          },
        ],
      },
    ]);
    onClose();
  };

  // Calculate totals from all field sets across all plans
  const allFieldSets = paymentPlans.flatMap((plan) => plan.fieldSets);
  const totalPercentage = allFieldSets.reduce(
    (sum, fs) => sum + (fs.percentage || 0),
    0
  );
  const totalAmount = allFieldSets.reduce(
    (sum, fs) => sum + (fs.amount || 0),
    0
  );
  const totalFieldSets = allFieldSets.length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-purple-600" />
            Add Payment Plans
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Create payment plans with dates, percentages, and amounts for
            property ID: {rowId?.substring(0, 8)}...
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Plans
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold">{paymentPlans.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Fields
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold">{totalFieldSets}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Percentage
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">{totalPercentage}%</div>
                  {totalPercentage > 100 && (
                    <Badge variant="destructive" className="text-xs">
                      Exceeds 100%
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Amount
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold">
                  ${totalAmount.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Plans */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Payment Plans</h3>
              <Button
                onClick={addPaymentPlan}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Plan
              </Button>
            </div>

            {paymentPlans.map((plan, planIndex) => (
              <Card key={plan.id} className="relative">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Payment Plan {planIndex + 1}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => addFieldSet(plan.id)}
                        variant="outline"
                        size="sm"
                        className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4" />
                        Add Field
                      </Button>
                      {paymentPlans.length > 1 && (
                        <Button
                          onClick={() => removePaymentPlan(plan.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {plan.fieldSets.map((fieldSet, fieldIndex) => (
                    <div key={fieldSet.id} className="space-y-4">
                      {/* Field Set Header */}
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Field Set {fieldIndex + 1}
                        </h4>
                        {plan.fieldSets.length > 1 && (
                          <Button
                            onClick={() => removeFieldSet(plan.id, fieldSet.id)}
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
                          <Label
                            htmlFor={`date-${fieldSet.id}`}
                            className="flex items-center gap-2"
                          >
                            <Calendar className="h-4 w-4 text-blue-500" />
                            Payment Date
                          </Label>
                          <Input
                            id={`date-${fieldSet.id}`}
                            type="date"
                            value={fieldSet.date}
                            onChange={(e) =>
                              updateFieldSet(
                                plan.id,
                                fieldSet.id,
                                "date",
                                e.target.value
                              )
                            }
                            className="w-full"
                          />
                        </div>

                        {/* Percentage */}
                        <div className="space-y-2">
                          <Label
                            htmlFor={`percentage-${fieldSet.id}`}
                            className="flex items-center gap-2"
                          >
                            <Percent className="h-4 w-4 text-green-500" />
                            Percentage
                          </Label>
                          <div className="relative">
                            <Input
                              id={`percentage-${fieldSet.id}`}
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={fieldSet.percentage || ""}
                              onChange={(e) =>
                                updateFieldSet(
                                  plan.id,
                                  fieldSet.id,
                                  "percentage",
                                  Number.parseFloat(e.target.value) || 0
                                )
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
                          <Label
                            htmlFor={`amount-${fieldSet.id}`}
                            className="flex items-center gap-2"
                          >
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
                                updateFieldSet(
                                  plan.id,
                                  fieldSet.id,
                                  "amount",
                                  Number.parseFloat(e.target.value) || 0
                                )
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
                      {fieldSet.date &&
                        fieldSet.percentage > 0 &&
                        fieldSet.amount > 0 && (
                          <div className="ml-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300">
                            <strong>Summary:</strong> Pay $
                            {fieldSet.amount.toLocaleString()} (
                            {fieldSet.percentage}%) on{" "}
                            {new Date(fieldSet.date).toLocaleDateString()}
                          </div>
                        )}
                    </div>
                  ))}

                  {/* Plan Summary */}
                  <div className="pt-4 border-t">
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">
                        Plan {planIndex + 1} Summary
                      </h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Field Sets:
                          </span>
                          <div className="font-medium">
                            {plan.fieldSets.length}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Total %:
                          </span>
                          <div className="font-medium">
                            {plan.fieldSets.reduce(
                              (sum, fs) => sum + (fs.percentage || 0),
                              0
                            )}
                            %
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Total Amount:
                          </span>
                          <div className="font-medium">
                            $
                            {plan.fieldSets
                              .reduce((sum, fs) => sum + (fs.amount || 0), 0)
                              .toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between pt-6">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Total: {totalPercentage}% | ${totalAmount.toLocaleString()} |{" "}
              {totalFieldSets} field sets
            </span>
            {totalPercentage > 100 && (
              <Badge variant="destructive" className="text-xs">
                Percentage exceeds 100%
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                totalPercentage > 100 ||
                paymentPlans.every((plan) =>
                  plan.fieldSets.every(
                    (fs) => !fs.date || fs.percentage <= 0 || fs.amount <= 0
                  )
                )
              }
              className="bg-purple-600 hover:bg-purple-700"
            >
              Save Payment Plans
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// "use client";

// import { useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Plus, Trash2, Calendar, Percent, DollarSign, X } from "lucide-react";
// import { Badge } from "@/components/ui/badge";

// interface PaymentPlan {
//   id: string;
//   date: string;
//   percentage: number;
//   amount: number;
//   customFields: { [key: string]: string | number };
// }

// interface CustomField {
//   id: string;
//   name: string;
//   type: "text" | "number" | "date";
//   value: string | number;
// }

// interface PaymentPlanModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   rowId: string | null;
//   onPaymentPlanSave: (data: any) => void;
// }

// export default function PaymentPlanModal({
//   isOpen,
//   onClose,
//   rowId,
//   onPaymentPlanSave,
// }: PaymentPlanModalProps) {
//   const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([
//     {
//       id: "1",
//       date: "",
//       percentage: 0,
//       amount: 0,
//       customFields: {},
//     },
//   ]);

//   const addCustomField = (planId: string) => {
//     const fieldName = prompt("Enter field name:");
//     if (!fieldName) return;

//     const fieldType = prompt("Enter field type (text/number/date):") as
//       | "text"
//       | "number"
//       | "date";
//     if (!["text", "number", "date"].includes(fieldType)) {
//       alert("Invalid field type. Please use: text, number, or date");
//       return;
//     }

//     setPaymentPlans(
//       paymentPlans.map((plan) =>
//         plan.id === planId
//           ? {
//               ...plan,
//               customFields: {
//                 ...plan.customFields,
//                 [fieldName]: fieldType === "number" ? 0 : "",
//               },
//             }
//           : plan
//       )
//     );
//   };

//   const removeCustomField = (planId: string, fieldName: string) => {
//     setPaymentPlans(
//       paymentPlans.map((plan) =>
//         plan.id === planId
//           ? {
//               ...plan,
//               customFields: Object.fromEntries(
//                 Object.entries(plan.customFields).filter(
//                   ([key]) => key !== fieldName
//                 )
//               ),
//             }
//           : plan
//       )
//     );
//   };

//   const updateCustomField = (
//     planId: string,
//     fieldName: string,
//     value: string | number
//   ) => {
//     setPaymentPlans(
//       paymentPlans.map((plan) =>
//         plan.id === planId
//           ? {
//               ...plan,
//               customFields: {
//                 ...plan.customFields,
//                 [fieldName]: value,
//               },
//             }
//           : plan
//       )
//     );
//   };

//   const addPaymentPlan = () => {
//     const newPlan: PaymentPlan = {
//       id: Date.now().toString(),
//       date: "",
//       percentage: 0,
//       amount: 0,
//       customFields: {},
//     };
//     setPaymentPlans([...paymentPlans, newPlan]);
//   };

//   const removePaymentPlan = (id: string) => {
//     if (paymentPlans.length > 1) {
//       setPaymentPlans(paymentPlans.filter((plan) => plan.id !== id));
//     }
//   };

//   const updatePaymentPlan = (
//     id: string,
//     field: keyof PaymentPlan,
//     value: string | number
//   ) => {
//     setPaymentPlans(
//       paymentPlans.map((plan) =>
//         plan.id === id ? { ...plan, [field]: value } : plan
//       )
//     );
//   };

//   const handleSave = () => {
//     const validPlans = paymentPlans.filter(
//       (plan) => plan.date && plan.percentage > 0 && plan.amount > 0
//     );

//     if (validPlans.length === 0) {
//       alert(
//         "Please add at least one valid payment plan with date, percentage, and amount."
//       );
//       return;
//     }

//     const totalPercentage = validPlans.reduce(
//       (sum, plan) => sum + plan.percentage,
//       0
//     );
//     if (totalPercentage > 100) {
//       alert("Total percentage cannot exceed 100%.");
//       return;
//     }

//     const paymentPlanData = {
//       rowId,
//       paymentPlans: validPlans,
//       totalPercentage,
//       totalAmount: validPlans.reduce((sum, plan) => sum + plan.amount, 0),
//     };

//     onPaymentPlanSave(paymentPlanData);
//   };

//   const handleClose = () => {
//     setPaymentPlans([
//       {
//         id: "1",
//         date: "",
//         percentage: 0,
//         amount: 0,
//         customFields: {},
//       },
//     ]);
//     onClose();
//   };

//   const totalPercentage = paymentPlans.reduce(
//     (sum, plan) => sum + (plan.percentage || 0),
//     0
//   );
//   const totalAmount = paymentPlans.reduce(
//     (sum, plan) => sum + (plan.amount || 0),
//     0
//   );

//   return (
//     <Dialog open={isOpen} onOpenChange={handleClose}>
//       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2">
//             <DollarSign className="h-5 w-5 text-purple-600" />
//             Add Payment Plans
//           </DialogTitle>
//           <p className="text-sm text-muted-foreground">
//             Create payment plans with dates, percentages, and amounts for
//             property ID: {rowId?.substring(0, 8)}...
//           </p>
//         </DialogHeader>

//         <div className="space-y-6">
//           {/* Summary Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <Card>
//               <CardHeader className="pb-2">
//                 <CardTitle className="text-sm font-medium text-muted-foreground">
//                   Total Plans
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="pt-0">
//                 <div className="text-2xl font-bold">{paymentPlans.length}</div>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader className="pb-2">
//                 <CardTitle className="text-sm font-medium text-muted-foreground">
//                   Total Percentage
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="pt-0">
//                 <div className="flex items-center gap-2">
//                   <div className="text-2xl font-bold">{totalPercentage}%</div>
//                   {totalPercentage > 100 && (
//                     <Badge variant="destructive" className="text-xs">
//                       Exceeds 100%
//                     </Badge>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader className="pb-2">
//                 <CardTitle className="text-sm font-medium text-muted-foreground">
//                   Total Amount
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="pt-0">
//                 <div className="text-2xl font-bold">
//                   ${totalAmount.toLocaleString()}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Payment Plans */}
//           <div className="space-y-4">
//             <div className="flex items-center justify-between">
//               <h3 className="text-lg font-semibold">Payment Plans</h3>
//               <Button
//                 onClick={addPaymentPlan}
//                 variant="outline"
//                 size="sm"
//                 className="gap-2"
//               >
//                 <Plus className="h-4 w-4" />
//                 Add Plan
//               </Button>
//             </div>

//             {paymentPlans.map((plan, index) => (
//               <Card key={plan.id} className="relative">
//                 <CardHeader className="pb-4">
//                   <div className="flex items-center justify-between">
//                     <CardTitle className="text-base">
//                       Payment Plan {index + 1}
//                     </CardTitle>
//                     {paymentPlans.length > 1 && (
//                       <Button
//                         onClick={() => removePaymentPlan(plan.id)}
//                         variant="ghost"
//                         size="sm"
//                         className="text-red-500 hover:text-red-700 hover:bg-red-50"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     )}
//                   </div>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                     {/* Date */}
//                     <div className="space-y-2">
//                       <Label
//                         htmlFor={`date-${plan.id}`}
//                         className="flex items-center gap-2"
//                       >
//                         <Calendar className="h-4 w-4 text-blue-500" />
//                         Payment Date
//                       </Label>
//                       <Input
//                         id={`date-${plan.id}`}
//                         type="date"
//                         value={plan.date}
//                         onChange={(e) =>
//                           updatePaymentPlan(plan.id, "date", e.target.value)
//                         }
//                         className="w-full"
//                       />
//                     </div>

//                     {/* Percentage */}
//                     <div className="space-y-2">
//                       <Label
//                         htmlFor={`percentage-${plan.id}`}
//                         className="flex items-center gap-2"
//                       >
//                         <Percent className="h-4 w-4 text-green-500" />
//                         Percentage
//                       </Label>
//                       <div className="relative">
//                         <Input
//                           id={`percentage-${plan.id}`}
//                           type="number"
//                           min="0"
//                           max="100"
//                           step="0.1"
//                           value={plan.percentage || ""}
//                           onChange={(e) =>
//                             updatePaymentPlan(
//                               plan.id,
//                               "percentage",
//                               Number.parseFloat(e.target.value) || 0
//                             )
//                           }
//                           className="pr-8"
//                           placeholder="0"
//                         />
//                         <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
//                           %
//                         </span>
//                       </div>
//                     </div>

//                     {/* Amount */}
//                     <div className="space-y-2">
//                       <Label
//                         htmlFor={`amount-${plan.id}`}
//                         className="flex items-center gap-2"
//                       >
//                         <DollarSign className="h-4 w-4 text-purple-500" />
//                         Amount
//                       </Label>
//                       <div className="relative">
//                         <Input
//                           id={`amount-${plan.id}`}
//                           type="number"
//                           min="0"
//                           step="0.01"
//                           value={plan.amount || ""}
//                           onChange={(e) =>
//                             updatePaymentPlan(
//                               plan.id,
//                               "amount",
//                               Number.parseFloat(e.target.value) || 0
//                             )
//                           }
//                           className="pl-8"
//                           placeholder="0.00"
//                         />
//                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
//                           $
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Custom Fields */}
//                   {Object.keys(plan.customFields).length > 0 && (
//                     <div className="space-y-3 pt-4 border-t">
//                       <div className="flex items-center justify-between">
//                         <h4 className="text-sm font-medium text-muted-foreground">
//                           Custom Fields
//                         </h4>
//                       </div>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         {Object.entries(plan.customFields).map(
//                           ([fieldName, fieldValue]) => (
//                             <div key={fieldName} className="space-y-2">
//                               <div className="flex items-center justify-between">
//                                 <Label className="capitalize">
//                                   {fieldName}
//                                 </Label>
//                                 <Button
//                                   onClick={() =>
//                                     removeCustomField(plan.id, fieldName)
//                                   }
//                                   variant="ghost"
//                                   size="sm"
//                                   className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
//                                 >
//                                   <X className="h-3 w-3" />
//                                 </Button>
//                               </div>
//                               <Input
//                                 type={
//                                   typeof fieldValue === "number"
//                                     ? "number"
//                                     : "text"
//                                 }
//                                 value={fieldValue}
//                                 onChange={(e) => {
//                                   const value =
//                                     typeof fieldValue === "number"
//                                       ? Number.parseFloat(e.target.value) || 0
//                                       : e.target.value;
//                                   updateCustomField(plan.id, fieldName, value);
//                                 }}
//                                 placeholder={`Enter ${fieldName}`}
//                               />
//                             </div>
//                           )
//                         )}
//                       </div>
//                     </div>
//                   )}

//                   {/* Add Custom Field Button */}
//                   <div className="pt-3 border-t">
//                     <Button
//                       onClick={() => addCustomField(plan.id)}
//                       variant="outline"
//                       size="sm"
//                       className="w-full gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
//                     >
//                       <Plus className="h-4 w-4" />
//                       Add Custom Field
//                     </Button>
//                   </div>

//                   {/* Plan Summary */}
//                   {plan.date && plan.percentage > 0 && plan.amount > 0 && (
//                     <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
//                       <p className="text-sm text-muted-foreground">
//                         <strong>Summary:</strong> Pay $
//                         {plan.amount.toLocaleString()} ({plan.percentage}%) on{" "}
//                         {new Date(plan.date).toLocaleDateString()}
//                       </p>
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>

//         <DialogFooter className="flex items-center justify-between pt-6">
//           <div className="flex items-center gap-4 text-sm text-muted-foreground">
//             <span>
//               Total: {totalPercentage}% | ${totalAmount.toLocaleString()}
//             </span>
//             {totalPercentage > 100 && (
//               <Badge variant="destructive" className="text-xs">
//                 Percentage exceeds 100%
//               </Badge>
//             )}
//           </div>
//           <div className="flex gap-2">
//             <Button variant="outline" onClick={handleClose}>
//               Cancel
//             </Button>
//             <Button
//               onClick={handleSave}
//               disabled={
//                 totalPercentage > 100 ||
//                 paymentPlans.every(
//                   (plan) =>
//                     !plan.date || plan.percentage <= 0 || plan.amount <= 0
//                 )
//               }
//               className="bg-purple-600 hover:bg-purple-700"
//             >
//               Save Payment Plans
//             </Button>
//           </div>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }
