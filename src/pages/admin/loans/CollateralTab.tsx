import { Control } from "react-hook-form";
import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash, Shield } from "lucide-react";

interface CollateralTabProps {
  control: Control<any>;
  currentTab: string;
  fields: any[];
  append: (value: any) => void;
  remove: (index: number) => void;
  isLoading?: boolean;
}

const CollateralTab = ({
  control,
  currentTab,
  fields,
  append,
  remove,
  isLoading,
}: CollateralTabProps) => {
  if (currentTab !== "collateral") return null;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Loading Collateral...</h3>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-pulse bg-gray-200 w-full h-full rounded-lg"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold">Collateral Information</h3>
        </div>
        <CardDescription>Provide details about loan collateral</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-6 pt-6">
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {fields.map((item, index) => (
              <div key={item.id} className="space-y-3 border p-4 rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name={`collateral.${index}.ownerName`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Owner Name</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} className="bg-white" />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`collateral.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} className="bg-white" />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`collateral.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} className="bg-white" />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`collateral.${index}.ownerContact`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Owner Contact</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} className="bg-white" />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`collateral.${index}.estimatedValue`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Value</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="bg-white"
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === "" ? 0 : parseFloat(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => remove(index)}
                  className="mt-2"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Remove Collateral
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            onClick={() =>
              append({
                type: "",
                description: "",
                estimatedValue: 0,
                ownerName: "",
                ownerContact: "",
              })
            }
            variant="outline"
            className="w-full border-dashed"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Collateral
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CollateralTab;
