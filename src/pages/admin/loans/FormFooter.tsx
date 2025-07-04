import { Button } from "@/components/ui/button";
import { LoanApplication } from "@/types/api";

interface FormFooterProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isSubmitting: boolean;
  setShowForm: (show: boolean) => void;
  editLoan?: LoanApplication | null;
}

const FormFooter: React.FC<FormFooterProps> = ({
  currentTab,
  setCurrentTab,
  isSubmitting,
  setShowForm,
  editLoan
}) => {
  const getSubmitButtonText = () => {
    if (isSubmitting) return "Processing...";
    
    const sectionNames = {
      basic: "Basic Info",
      guarantors: "Guarantors",
      nextOfKin: "Next of Kin",
      collateral: "Collateral"
    };
    
    return editLoan 
      ? `Update ${sectionNames[currentTab as keyof typeof sectionNames] || ''}`
      : "Submit Application";
  };

  return (
    <div className="flex justify-between pt-4 border-t bg-white sticky bottom-0 z-10 px-6">

      {!editLoan && ( // Only show navigation in create mode
        <div className="flex gap-2">
          {currentTab !== "basic" && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const tabs = ["basic", "guarantors", "nextOfKin", "collateral"];
                const currentIndex = tabs.indexOf(currentTab);
                setCurrentTab(tabs[currentIndex - 1]);
              }}
            >
              Previous
            </Button>
          )}
          {currentTab !== "collateral" && (
            <Button
              type="button"
              onClick={() => {
                const tabs = ["basic", "guarantors", "nextOfKin", "collateral"];
                const currentIndex = tabs.indexOf(currentTab);
                setCurrentTab(tabs[currentIndex + 1]);
              }}
            >
              Next
            </Button>
          )}
        </div>
      )}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowForm(false)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {getSubmitButtonText()}
        </Button>
      </div>
    </div>
  );
};
export default FormFooter;