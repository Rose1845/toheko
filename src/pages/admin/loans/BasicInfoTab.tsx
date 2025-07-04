import { Control, useWatch } from "react-hook-form";
import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface BasicInfoTabProps {
  control: Control<any>;
  currentTab: string;
  watch: any;
  loanProducts?: Array<{ id: number; name: string; rate: string }>;
  members?: Array<{ memberId: number; firstName: string; lastName: string; idNo: string }>;
  isLoadingLoanProducts?: boolean;
  isLoadingMembers?: boolean;
}

const BasicInfoTab = ({ 
  control, 
  currentTab, 
  watch,
  loanProducts = [],
  members = [],
  isLoadingLoanProducts = false,
  isLoadingMembers = false
}: BasicInfoTabProps) => {
  const watchedMemberId = watch("memberId");
  const watchedApplicantIdNo = watch("applicantIdNo");

  // When member is selected, auto-fill their ID number if available
  const selectedMember = members.find(m => m.memberId === watchedMemberId);
  const memberIdNo = selectedMember?.idNo || '';

  if (currentTab !== "basic") return null;

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Loan Details</h3>
        <CardDescription>Enter the basic information for your loan application</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Loan Product Field */}
            <FormField
              control={control}
              name="loanProductId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Loan Product</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                      disabled={isLoadingLoanProducts}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select loan product" />
                      </SelectTrigger>
                      <SelectContent>
                        {loanProducts.map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name} ({product.rate})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            {/* Member Selection */}
            <FormField
              control={control}
              name="memberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Member</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                      disabled={isLoadingMembers}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem
                            key={member.memberId}
                            value={member.memberId.toString()}
                          >
                            {member.firstName} {member.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            {/* Applicant ID Number - Can be different from member ID */}
            <FormField
              control={control}
              name="applicantIdNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Applicant ID Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-white"
                      placeholder={memberIdNo} // Show member's ID as placeholder
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            {/* Other fields... */}
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Loan Name</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} className="bg-white" />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Amount</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      className="bg-white"
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="termDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Term (Days)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      className="bg-white"
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInfoTab;