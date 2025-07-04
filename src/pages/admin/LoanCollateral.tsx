// /* eslint-disable @typescript-eslint/no-explicit-any */
// import React, { useState, useEffect, useMemo } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { format } from "date-fns";
// import { Edit, Trash, Plus, Loader2, Users } from "lucide-react";
// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import DashboardLayout from "./DashboardLayout";
// import { DataTable, Column } from "@/components/ui/data-table";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useToast } from "@/hooks/use-toast";
// import {
//   BoardMember,
//   BoardMemberRequest,
//   LoanCollateralItem,
//   LoanPenalty,
// } from "@/types/api";
// import { boardMemberService } from "@/services/boardMemberService";
// import { memberService } from "@/services/memberService";
// import { loanService } from "@/services/loanService";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// export const formSchema = z.object({
//   id: z.number().optional(),
//   type: z.string().min(1, "type is required"),
//   loanApplicationId: z.coerce.number().min(0),
//   estimatedValue: z.coerce.number().min(0),
//   ownerName: z.string(),
//   ownerContact: z.string(),
//   description: z.string(),
// });
// type FormValues = z.infer<typeof formSchema>;

// const LoanCollateral = () => {
//   const [showForm, setShowForm] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
//   const [selectedMember, setSelectedMember] =
//     useState<LoanCollateralItem | null>(null);
//   const { toast } = useToast();
//   const { data: loanTypes } = useQuery({
//     queryKey: ["loan-types"],
//     queryFn: loanService.getAllLoanTypes,
//     onError: (error) => {
//       console.error("Error fetching loan types:", error);
//       toast({
//         title: "Error",
//         description: "Failed to fetch loan types. Please try again later.",
//         variant: "destructive",
//       });
//     },
//   });

//   const { data: loanProducts } = useQuery({
//         queryKey: ["loan-products"],
//         queryFn: loanService.getAllLoanTypes,
//   });

//   console.log("loan application", loanProducts);

//   const form = useForm<FormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       id: 0,
//       loanApplicationId: 0,
//       type: "",
//       estimatedValue: 0,
//       ownerContact: "",
//       ownerName: "",
//       description: "",
//     },
//   });

//   // Fetch Loan Collaterals
//   const {
//     data: LoanCollaterals,
//     isLoading,
//     error,
//     refetch,
//   } = useQuery({
//     queryKey: ["loancollaterals"],
//     queryFn: loanService.getAllLoanCollaterals,
//     onError: (error) => {
//       console.error("Failed to fetch Loan Collaterals:", error);
//       toast({
//         title: "Error",
//         description: "Failed to fetch loan collaterals. Please try again later.",
//         variant: "destructive",
//       });
//     },
//   });
//   const handleAddNew = () => {
//     form.reset({
//       id: undefined,
//       loanApplicationId: 0,
//       type: "",
//       estimatedValue: 0,
//       ownerContact: "",
//       ownerName: "",
//       description: "",
//     });
//     setIsEditing(false);
//     setShowForm(true);
//   };

//   const handleEdit = (product: LoanCollateralItem) => {
//     form.reset({
//       id: product.id,
//       loanApplicationId: product.loanApplicationId,
//       type: product.type,
//       estimatedValue: product.estimatedValue,
//       description: product.description,
//       ownerContact: product.ownerContact,
//       ownerName: product.ownerName,
//     });
//     setIsEditing(true);
//     setShowForm(true);
//   };

//   const handleDelete = (product: LoanCollateralItem) => {
//     setSelectedMember(product);
//     setShowDeleteDialog(true);
//   };

//   const confirmDelete = async () => {
//     if (!selectedMember) return;

//     try {
//       await loanService.deleteLoanCollateral(selectedMember.id);
//       toast({
//         title: "Success",
//         description: "Loan Products deleted successfully",
//       });
//       refetch();
//     } catch (error) {
//       console.error("Error deleting Loan Products:", error);
//       toast({
//         title: "Error",
//         description: "Failed to delete Loan Products",
//         variant: "destructive",
//       });
//     } finally {
//       setShowDeleteDialog(false);
//       setSelectedMember(null);
//     }
//   };

//   const onSubmit = async (values: FormValues) => {
//     try {
//       const LoanPenaltyData: LoanCollateralItem = {
//         id: values.id || 0,
//         loanApplicationId: values.loanApplicationId,
//         type: values.type,
//         estimatedValue: values.estimatedValue,
//         description: values.description,
//         ownerContact: values.ownerContact,
//         ownerName: values.ownerName,
//       };

//       if (isEditing) {
//         await loanService.updateLoanCollateral(LoanPenaltyData);
//         toast({
//           title: "Success",
//           description: "Loan Collateral updated successfully",
//         });
//       } else {
//         await loanService.createLoanCollateral(LoanPenaltyData);
//         toast({
//           title: "Success",
//           description: "Loan Collateral added successfully",
//         });
//       }

//       setShowForm(false);
//       form.reset();
//       refetch();
//     } catch (error) {
//       console.error("Error saving Loan Collateral:", error);
//       toast({
//         title: "Error",
//         description: isEditing
//           ? "Failed to update Loan Collateral"
//           : "Failed to add Loan Collateral",
//         variant: "destructive",
//       });
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status.toUpperCase()) {
//       case "ACTIVE":
//         return "bg-green-100 text-green-800";
//       case "INACTIVE":
//         return "bg-red-100 text-red-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   // Define columns for DataTable
//   const columns: Column<LoanCollateralItem & { type?: string }>[] = [
//     {
//       header: "ID",
//       accessorKey: "id",
//       sortable: true,
//     },
//     {
//       header: "type",
//       accessorKey: "type",
//       sortable: true,
//       cell: (LoanPenalty) => (
//         <span className="font-medium">{LoanPenalty.type}</span>
//       ),
//     },
//     {
//       header: "Estmated Value",
//       accessorKey: "estimatedValue",
//       sortable: true,
//       cell: (LoanPenalty) => (
//         <span className="font-medium">{LoanPenalty.estimatedValue}</span>
//       ),
//     },
//     {
//       header: "OwnerName",
//       accessorKey: "ownerName",
//       sortable: true,
//       cell: (LoanPenalty) => (
//         <span className="font-medium">{LoanPenalty.ownerName}</span>
//       ),
//     },

//     {
//       header: "ownerContact",
//       accessorKey: "ownerContact",
//       cell: (LoanPenalty) => <span>{LoanPenalty.ownerContact}</span>,
//     },

//     {
//       header: "Actions",
//       accessorKey: "id",
//       cell: (LoanPenalty) => (
//         <div className="flex space-x-2 justify-end">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={(e) => {
//               e.stopPropagation();
//               handleEdit(LoanPenalty);
//             }}
//           >
//             <Edit className="h-4 w-4 mr-1" />
//             Edit
//           </Button>
//           <Button
//             variant="destructive"
//             size="sm"
//             onClick={(e) => {
//               e.stopPropagation();
//               handleDelete(LoanPenalty);
//             }}
//           >
//             <Trash className="h-4 w-4 mr-1" />
//             Delete
//           </Button>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <DashboardLayout>
//       <div className="container mx-auto py-8">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between">
//             <div>
//               <CardTitle>Loan Collaterals</CardTitle>
//               <CardDescription>
//                 Manage collaterals for loans here
//               </CardDescription>
//             </div>
//             <Button onClick={handleAddNew}>
//               <Plus className="mr-2 h-4 w-4" /> Add New
//             </Button>
//           </CardHeader>
//           <CardContent>
//             {error ? (
//               <div className="flex justify-center p-4">
//                 <p className="text-red-500">Error loading loan collaterals. Please try again.</p>
//               </div>
//             ) : isLoading ? (
//               <div className="flex justify-center items-center py-8">
//                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
//                 <span className="ml-2">Loading Loan Collaterals...</span>
//               </div>
//             ) : LoanCollaterals?.length === 0 ? (
//               <div className="text-center py-10">
//                 <Users className="mx-auto h-12 w-12 text-muted-foreground" />
//                 <h3 className="mt-4 text-lg font-semibold">
//                   No loan Collaterals found
//                 </h3>
//                 <p className="mt-2 text-sm text-muted-foreground">
//                   Get started by adding a new Loan Collaterals
//                 </p>
//                 <Button
//                   onClick={handleAddNew}
//                   className="mt-4"
//                   variant="outline"
//                 >
//                   <Plus className="mr-2 h-4 w-4" />
//                   Add Loan Collateral
//                 </Button>
//               </div>
//             ) : (
//               <DataTable
//                 data={LoanCollaterals || []}
//                 columns={columns}
//                 keyField="id"
//                 pagination={true}
//                 searchable={true}
//                 pageSize={10}
//                 pageSizeOptions={[5, 10, 25, 50]}
//                 emptyMessage="No Loan Collaterals found"
//                 loading={isLoading}
//                 onRowClick={(boardMember) => handleEdit(boardMember)}
//               />
//             )}
//           </CardContent>
//         </Card>

//         <Dialog open={showForm} onOpenChange={setShowForm}>
//           <DialogContent className="sm:max-w-[600px] overflow-y-auto">
//             <DialogHeader>
//               <DialogTitle>
//                 {isEditing
//                   ? "Edit Loan Collaterals"
//                   : "Add New Loan Collaterals"}
//               </DialogTitle>
//               <DialogDescription>
//                 {isEditing
//                   ? "Update the Loan Collaterals's information below."
//                   : "Add a new Loan Collaterals by filling in the information below."}
//               </DialogDescription>
//             </DialogHeader>
//             <Form {...form}>
//               <form
//                 onSubmit={form.handleSubmit(onSubmit)}
//                 className="space-y-4 overflow-y-auto pr-2"
//               >
//                 <Tabs defaultValue="basic" className="w-full">
//                   <TabsList className="grid grid-cols-4 gap-2">
//                     <TabsTrigger value="basic">Basic Info</TabsTrigger>
//                   </TabsList>
//                   <TabsContent value="basic" className="space-y-4 pt-4">
// <FormField
//   control={form.control}
//   name="loanApplicationId"
//   render={({ field }) => (
//     <FormItem>
//       <FormLabel>Loan Product</FormLabel>
//       <FormControl>
//         <Select
//           onValueChange={(value) => field.onChange(parseInt(value))}
//           defaultValue={
//             field.value ? field.value.toString() : undefined
//           }
//         >
//           <SelectTrigger>
//             <SelectValue placeholder="Select loan product" />
//           </SelectTrigger>
//           <SelectContent>
//             {loanProducts?.map((product: any) => (
//               <SelectItem
//                 key={product.id}
//                 value={product.id.toString()}
//               >
//                 {product.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </FormControl>
//       <FormMessage />
//     </FormItem>
//   )}
// />

//                     <FormField
//                       control={form.control}
//                       name="type"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Type</FormLabel>
//                           <FormControl>
//                             <Select
//                               onValueChange={field.onChange}
//                               defaultValue={field.value}
//                             >
//                               <SelectTrigger>
//                                 <SelectValue placeholder="Select penalty type" />
//                               </SelectTrigger>
//                               <SelectContent>
//                                 <SelectItem value="DAILY_PERCENTAGE">
//                                   Daily Percentage
//                                 </SelectItem>
//                                 <SelectItem value="FLAT">Flat</SelectItem>
//                                 <SelectItem value="PERCENTAGE">
//                                   Percentage
//                                 </SelectItem>
//                                 <SelectItem value="NONE">None</SelectItem>
//                               </SelectContent>
//                             </Select>
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />

//                     <FormField
//                       control={form.control}
//                       name="estimatedValue"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>EstimatedValue</FormLabel>
//                           <FormControl>
//                             <Input type="number" step="0.01" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       control={form.control}
//                       name="ownerContact"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Contact</FormLabel>
//                           <FormControl>
//                             <Input type="text" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       control={form.control}
//                       name="ownerName"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>OwnerName</FormLabel>
//                           <FormControl>
//                             <Input type="text" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </TabsContent>
//                 </Tabs>

//                 <DialogFooter className="pt-4">
//                   <Button
//                     variant="outline"
//                     type="button"
//                     onClick={() => setShowForm(false)}
//                   >
//                     Cancel
//                   </Button>
//                   <Button type="submit">{isEditing ? "Update" : "Add"}</Button>
//                 </DialogFooter>
//               </form>
//             </Form>
//           </DialogContent>
//         </Dialog>

//         {/* Delete Confirmation Dialog */}
//         <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
//           <DialogContent className="sm:max-w-[425px]">
//             <DialogHeader>
//               <DialogTitle>Confirm Delete</DialogTitle>
//               <DialogDescription>
//                 Are you sure you want to delete this Loan Collateral? This
//                 action cannot be undone.
//               </DialogDescription>
//             </DialogHeader>
//             <DialogFooter className="mt-4">
//               <Button
//                 variant="outline"
//                 onClick={() => setShowDeleteDialog(false)}
//               >
//                 Cancel
//               </Button>
//               <Button variant="destructive" onClick={confirmDelete}>
//                 Delete
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </div>
//     </DashboardLayout>
//   );
// };

// export default LoanCollateral;
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Edit, Trash, Plus, Loader2, Users } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DashboardLayout from "./DashboardLayout";
import { DataTable, Column } from "@/components/ui/data-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  BoardMember,
  BoardMemberRequest,
  LoanCollateralItem,
  LoanPenalty,
} from "@/types/api";
import { boardMemberService } from "@/services/boardMemberService";
import { memberService } from "@/services/memberService";
import { loanService } from "@/services/loanService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const formSchema = z.object({
  id: z.number().optional(),
  type: z.string().min(1, "type is required"),
  loanApplicationId: z.coerce.number().min(0),
  estimatedValue: z.coerce.number().min(0),
  ownerName: z.string(),
  ownerContact: z.string(),
  description: z.string(),
});
type FormValues = z.infer<typeof formSchema>;

const LoanCollateral = () => {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMember, setSelectedMember] =
    useState<LoanCollateralItem | null>(null);
  const { toast } = useToast();
  
  const { data: loanTypes } = useQuery({
    queryKey: ["loan-types"],
    queryFn: loanService.getAllLoanTypes,
    onError: (error) => {
      console.error("Error fetching loan types:", error);
      toast({
        title: "Error",
        description: "Failed to fetch loan types. Please try again later.",
        variant: "destructive",
      });
    },
  });

    const { data: loanApplications = [] } = useQuery({
      queryKey: ["loan-applications"],
      queryFn: loanService.getAllLoanApplications,
    });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: 0,
      loanApplicationId: 0,
      type: "",
      estimatedValue: 0,
      ownerContact: "",
      ownerName: "",
      description: "",
    },
  });

  // Fetch Loan Collaterals
  const {
    data: LoanCollaterals,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["loancollaterals"],
    queryFn: loanService.getAllLoanCollaterals,
    onError: (error) => {
      console.error("Failed to fetch Loan Collaterals:", error);
      toast({
        title: "Error",
        description: "Failed to fetch loan collaterals. Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleAddNew = () => {
    form.reset({
      id: undefined,
      loanApplicationId: 0,
      type: "",
      estimatedValue: 0,
      ownerContact: "",
      ownerName: "",
      description: "",
    });
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEdit = (product: LoanCollateralItem) => {
    form.reset({
      id: product.id,
      loanApplicationId: product.loanApplicationId,
      type: product.type,
      estimatedValue: product.estimatedValue,
      description: product.description,
      ownerContact: product.ownerContact,
      ownerName: product.ownerName,
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = (product: LoanCollateralItem) => {
    setSelectedMember(product);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedMember) return;

    try {
      await loanService.deleteLoanCollateral(selectedMember.id);
      toast({
        title: "Success",
        description: "Loan collateral deleted successfully",
      });
      refetch();
    } catch (error) {
      console.error("Error deleting loan collateral:", error);
      toast({
        title: "Error",
        description: "Failed to delete loan collateral",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setSelectedMember(null);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const LoanPenaltyData: LoanCollateralItem = {
        id: values.id || 0,
        loanApplicationId: values.loanApplicationId,
        type: values.type,
        estimatedValue: values.estimatedValue,
        description: values.description,
        ownerContact: values.ownerContact,
        ownerName: values.ownerName,
      };

      if (isEditing) {
        await loanService.updateLoanCollateral(
          LoanPenaltyData.loanApplicationId,
          [LoanPenaltyData]
        );
        toast({
          title: "Success",
          description: "Loan collateral updated successfully",
        });
      } else {
        await loanService.createLoanCollateral(LoanPenaltyData);
        toast({
          title: "Success",
          description: "Loan collateral added successfully",
        });
      }

      setShowForm(false);
      form.reset();
      refetch();
    } catch (error) {
      console.error("Error saving loan collateral:", error);
      toast({
        title: "Error",
        description: isEditing
          ? "Failed to update loan collateral"
          : "Failed to add loan collateral",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Define columns for DataTable
  const columns: Column<LoanCollateralItem & { type?: string }>[] = [
    {
      header: "ID",
      accessorKey: "id",
      sortable: true,
    },
    {
      header: "Type",
      accessorKey: "type",
      sortable: true,
      cell: (LoanPenalty) => (
        <Badge variant="outline" className="capitalize">
          {LoanPenalty.type?.toLowerCase().replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      header: "Estimated Value",
      accessorKey: "estimatedValue",
      sortable: true,
      cell: (LoanPenalty) => (
        <span className="font-medium">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(LoanPenalty.estimatedValue)}
        </span>
      ),
    },
    {
      header: "Owner Name",
      accessorKey: "ownerName",
      sortable: true,
      cell: (LoanPenalty) => (
        <span className="font-medium">{LoanPenalty.ownerName}</span>
      ),
    },
    {
      header: "Owner Contact",
      accessorKey: "ownerContact",
      cell: (LoanPenalty) => (
        <span className="text-muted-foreground">{LoanPenalty.ownerContact}</span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (LoanPenalty) => (
        <div className="flex space-x-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(LoanPenalty);
            }}
            className="hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(LoanPenalty);
            }}
            className="hover:bg-destructive/90 transition-colors"
          >
            <Trash className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <Card className="border rounded-lg shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between bg-muted/50 px-6 py-4 border-b">
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Loan Collaterals
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage collaterals for loans in your system
              </CardDescription>
            </div>
            <Button onClick={handleAddNew} className="gap-1">
              <Plus className="h-4 w-4" />
              <span>Add New</span>
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {error ? (
              <div className="flex justify-center p-4 bg-destructive/10 rounded-lg">
                <p className="text-destructive">
                  Error loading loan collaterals. Please try again.
                </p>
              </div>
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  Loading loan collaterals...
                </span>
              </div>
            ) : LoanCollaterals?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                <Users className="h-12 w-12 text-muted-foreground" />
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">
                    No loan collaterals found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Get started by adding a new loan collateral
                  </p>
                </div>
                <Button onClick={handleAddNew} className="mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Loan Collateral
                </Button>
              </div>
            ) : (
              <DataTable
                data={LoanCollaterals || []}
                columns={columns}
                keyField="id"
                pagination={true}
                searchable={true}
                pageSize={10}
                pageSizeOptions={[5, 10, 25, 50]}
                emptyMessage="No loan collaterals found"
                loading={isLoading}
                onRowClick={(boardMember) => handleEdit(boardMember)}
                className="border rounded-lg overflow-hidden"
              />
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {isEditing ? "Edit Loan Collateral" : "Add New Loan Collateral"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update the collateral information below."
                  : "Fill in the details to add a new loan collateral."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid grid-cols-4 gap-2 bg-muted/50">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  </TabsList>
                  <TabsContent value="basic" className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="loanApplicationId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Loan Application</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={(value) => field.onChange(parseInt(value))}
                                defaultValue={
                                  field.value ? field.value.toString() : undefined
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="" />
                                </SelectTrigger>
                                <SelectContent>
                                  {loanApplications?.map((product: any) => (
                                    <SelectItem
                                      key={product.id}
                                      value={product.id}
                                    >
                                      {product.loanProductCode}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select collateral type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="DAILY_PERCENTAGE">
                                    Daily Percentage
                                  </SelectItem>
                                  <SelectItem value="FLAT">Flat</SelectItem>
                                  <SelectItem value="PERCENTAGE">
                                    Percentage
                                  </SelectItem>
                                  <SelectItem value="NONE">None</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="estimatedValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Value</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                              <Input 
                                type="number" 
                                step="0.01" 
                                {...field} 
                                className="pl-8"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="ownerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Owner Name</FormLabel>
                            <FormControl>
                              <Input type="text" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="ownerContact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Owner Contact</FormLabel>
                            <FormControl>
                              <Input type="text" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input type="text" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>

                <DialogFooter className="pt-4 border-t">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="min-w-24">
                    {isEditing ? "Update" : "Add"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-destructive">
                Confirm Deletion
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Are you sure you want to delete this loan collateral? This action
                cannot be undone and will permanently remove the collateral record.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="font-medium">
                Collateral ID: <span className="text-muted-foreground">{selectedMember?.id}</span>
              </p>
              <p className="font-medium mt-1">
                Type: <span className="text-muted-foreground">{selectedMember?.type}</span>
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDelete}
                className="hover:bg-destructive/90"
              >
                Confirm Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default LoanCollateral;