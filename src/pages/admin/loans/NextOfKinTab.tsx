import { Control } from "react-hook-form";
import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash, User } from "lucide-react";

interface NextOfKinTabProps {
  control: Control<any>;
  currentTab: string;
  fields: any[];
  append: (value: any) => void;
  remove: (index: number) => void;
  isLoading?: boolean;
}

const NextOfKinTab = ({ control, currentTab, fields, append, remove, isLoading }: NextOfKinTabProps) => {
  if (currentTab !== "nextOfKin") return null;
  if(isLoading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Loading Next of Kin...</h3>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-gray-500">Please wait...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold">Next of Kin Information</h3>
        </div>
        <CardDescription>Provide contact details of someone we can reach out to in case of emergency.</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {fields.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No next of kin added yet</p>
                <p className="text-sm">Click "Add Next of Kin" to begin</p>
              </div>
            ) : (
              fields.map((item, index) => (
                <div
                  key={item.id}
                  className="space-y-4 border border-gray-200 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-800">Next of Kin {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash className="mr-1 h-4 w-4" />
                      Remove
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name={`nextOfKin.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter full name" {...field} className="bg-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name={`nextOfKin.${index}.relationship`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Relationship</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Brother, Parent" {...field} className="bg-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name={`nextOfKin.${index}.email`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="example@mail.com" {...field} className="bg-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name={`nextOfKin.${index}.phone`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="0712 345 678" {...field} className="bg-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name={`nextOfKin.${index}.address`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-sm font-medium">Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter physical address" {...field} className="bg-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <Button
            type="button"
            onClick={() =>
              append({
                name: "",
                relationship: "",
                email: "",
                phone: "",
                address: "",
              })
            }
            variant="outline"
            className="w-full border-dashed border-2 border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400 py-3"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Next of Kin
          </Button>

          {fields.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Next of Kin Summary</span>
              </div>
              <div className="text-sm text-green-700">
                <p>Total Next of Kin: <span className="font-medium">{fields.length}</span></p>
                <p className="text-xs text-green-600 mt-1">
                  Ensure contact details are valid and reachable in case of emergency.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NextOfKinTab;
