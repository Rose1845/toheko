import React, { useState, useEffect } from 'react';
import UserDashboardLayout from './layout/UserDashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { ArrowRight, CheckCircle, CreditCard, Wallet } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { userPaymentService, Account, PaymentType, PaymentMode } from '@/services/user-services/userPaymentService';

// JWT token interface
interface TohekoJwtPayload {
  sub: string;
  userId: number;
  role: string;
  exp?: number;
  iat?: number;
}



// Main payment component
const Payments = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Data states
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
  const [loading, setLoading] = useState({
    accounts: true,
    paymentTypes: false,
    paymentModes: false
  });
  const [error, setError] = useState({
    accounts: '',
    paymentTypes: '',
    paymentModes: ''
  });

  // Form state
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType | null>(null);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<PaymentMode | null>(null);
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  const [paymentReference, setPaymentReference] = useState('');

  // Fetch accounts when component mounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const userId = getUserId();
        if (!userId) {
          setError(prev => ({ ...prev, accounts: 'User ID not found' }));
          setLoading(prev => ({ ...prev, accounts: false }));
          return;
        }

        const accountsData = await userPaymentService.getMemberAccounts(userId);
        setAccounts(accountsData);
        if (accountsData.length > 0) {
          // Auto-select the first account if there's only one
          if (accountsData.length === 1) {
            setSelectedAccount(accountsData[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
        setError(prev => ({ ...prev, accounts: 'Failed to load accounts' }));
      } finally {
        setLoading(prev => ({ ...prev, accounts: false }));
      }
    };

    fetchAccounts();
  }, []);

  // Fetch payment types when user moves to step 2
  useEffect(() => {
    if (currentStep === 2) {
      const fetchPaymentTypes = async () => {
        try {
          setLoading(prev => ({ ...prev, paymentTypes: true }));
          const typesData = await userPaymentService.getPaymentTypes();
          setPaymentTypes(typesData);
          // Auto-select the first payment type if there's only one
          if (typesData.length === 1) {
            setSelectedPaymentType(typesData[0]);
          }
        } catch (error) {
          console.error('Error fetching payment types:', error);
          setError(prev => ({ ...prev, paymentTypes: 'Failed to load payment types' }));
        } finally {
          setLoading(prev => ({ ...prev, paymentTypes: false }));
        }
      };

      fetchPaymentTypes();
    }
  }, [currentStep]);

  // Fetch payment modes when user moves to step 3
  useEffect(() => {
    if (currentStep === 3) {
      const fetchPaymentModes = async () => {
        try {
          setLoading(prev => ({ ...prev, paymentModes: true }));
          const modesData = await userPaymentService.getPaymentModes();
          setPaymentModes(modesData);
          // Auto-select M-PESA if available
          const mpesa = modesData.find(mode => mode.name.toLowerCase() === 'm-pesa');
          if (mpesa) {
            setSelectedPaymentMode(mpesa);
          } else if (modesData.length === 1) {
            setSelectedPaymentMode(modesData[0]);
          }
        } catch (error) {
          console.error('Error fetching payment modes:', error);
          setError(prev => ({ ...prev, paymentModes: 'Failed to load payment modes' }));
        } finally {
          setLoading(prev => ({ ...prev, paymentModes: false }));
        }
      };

      fetchPaymentModes();
    }
  }, [currentStep]);

  // Fetch user ID from JWT token
  const getUserId = (): number | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const decoded = jwtDecode<TohekoJwtPayload>(token);
      return decoded.userId;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const nextStep = () => {
    // Validation logic for each step
    if (currentStep === 1 && !selectedAccount) {
      toast.error('Please select an account');
      return;
    }
    
    if (currentStep === 2 && !selectedPaymentType) {
      toast.error('Please select a payment type');
      return;
    }
    
    if (currentStep === 3 && !selectedPaymentMode) {
      toast.error('Please select a payment mode');
      return;
    }
    
    if (currentStep === 4) {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }
      
      if (!phoneNumber) {
        toast.error('Please enter a phone number');
        return;
      }
    }
    
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAccount || !selectedPaymentType || !selectedPaymentMode || !amount) {
      toast.error('Please complete all required fields');
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Create payment
      const paymentData = {
        amount: Number(amount),
        accountId: selectedAccount.accountId,
        paymentTypeId: selectedPaymentType.paymentTypeId,
        modeOfPaymentId: selectedPaymentMode.modeOfPaymentId,
        phoneNumber,
        remarks: remarks || 'Payment via member portal'
      };

      // Create the payment record and get the requestID
      const paymentResponse = await userPaymentService.createPayment(paymentData);
      console.log('Payment created:', paymentResponse);
      
      // Extract the requestID from the payment response
      const paymentRequestId = paymentResponse.requestID;
      
      // Store the payment reference for the success screen
      setPaymentReference(paymentRequestId);
      
      // Step 2: If M-PESA selected, initiate STK push using the requestID as paymentReference
      if (selectedPaymentMode.name.toLowerCase().includes('m-pesa')) {
        const stkPushData = {
          amount: String(amount),
          phoneNumber,
          remarks: remarks || 'Payment via member portal',
          app: 'toheko', // Always use "toheko" as the app name
          paymentReference: paymentRequestId, // Use the requestID from payment creation as paymentReference
          memberId: selectedAccount.member.memberId // Include the memberId from the selected account
        };
        
        // Initiate the STK push
        const stkResponse = await userPaymentService.initiateSTKPush(stkPushData);
        console.log('STK push initiated:', stkResponse);
        
        toast.success('Payment initiated! Check your phone for M-PESA prompt.');
      } else {
        toast.success('Payment recorded successfully!');
      }
      
      setIsLoading(false);
      setCurrentStep(5); // Move to success step
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
      setIsLoading(false);
    }
  };

  // Render different steps based on current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Select Account</CardTitle>
              <CardDescription className="text-xs">Choose the account you want to make a payment to</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              {loading.accounts ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : error.accounts ? (
                <div className="text-center py-4 text-destructive text-sm">
                  <p>{error.accounts}</p>
                </div>
              ) : accounts.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  <p>No accounts found</p>
                </div>
              ) : (
                <div className="grid gap-2">
                  {accounts.map((account) => (
                    <div
                      key={account.accountId}
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${selectedAccount?.accountId === account.accountId ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
                      onClick={() => setSelectedAccount(account)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">{account.name}</h3>
                          <p className="text-xs text-muted-foreground">{account.accountNumber}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-2">
              <Button 
                disabled={!selectedAccount || loading.accounts} 
                onClick={nextStep}
                className="ml-auto"
                size="sm"
              >
                Next <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </CardFooter>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Select Payment Type</CardTitle>
              <CardDescription>
                Choose the type of payment you want to make
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading.paymentTypes ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading payment types...</span>
                  </div>
                ) : error.paymentTypes ? (
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50 text-red-600">
                    {error.paymentTypes}
                    <Button className="mt-2" variant="outline" onClick={() => window.location.reload()}>
                      Try Again
                    </Button>
                  </div>
                ) : paymentTypes.length === 0 ? (
                  <div className="p-4 border rounded-lg bg-muted/50 text-center">
                    <p>No payment types available. Please try again later.</p>
                  </div>
                ) : paymentTypes.map(type => (
                  <div 
                    key={type.paymentTypeId}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedPaymentType?.paymentTypeId === type.paymentTypeId ? 
                      'border-primary bg-primary/5' : 
                      'hover:border-gray-400'
                    }`}
                    onClick={() => setSelectedPaymentType(type)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium capitalize">{type.name}</h3>
                        {type.paymentShortDesc && (
                          <p className="text-sm text-muted-foreground">{type.paymentShortDesc}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button onClick={nextStep}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Select Payment Mode</CardTitle>
              <CardDescription>
                How would you like to make your payment?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {loading.paymentModes ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading payment modes...</span>
                  </div>
                ) : error.paymentModes ? (
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50 text-red-600">
                    {error.paymentModes}
                    <Button className="mt-2" variant="outline" onClick={() => window.location.reload()}>
                      Try Again
                    </Button>
                  </div>
                ) : paymentModes.length === 0 ? (
                  <div className="p-4 border rounded-lg bg-muted/50 text-center">
                    <p>No payment modes available. Please try again later.</p>
                  </div>
                ) : paymentModes.map(mode => (
                  <div 
                    key={mode.modeOfPaymentId}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedPaymentMode?.modeOfPaymentId === mode.modeOfPaymentId ? 
                      'border-primary bg-primary/5' : 
                      'hover:border-gray-400'
                    }`}
                    onClick={() => setSelectedPaymentMode(mode)}
                  >
                    <div className="flex flex-col items-center text-center">
                      {mode.name === 'M-PESA' ? (
                        <Wallet className="h-10 w-10 mb-2 text-green-600" />
                      ) : (
                        <CreditCard className="h-10 w-10 mb-2 text-blue-600" />
                      )}
                      <h3 className="font-medium">{mode.name}</h3>
                      <p className="text-sm text-muted-foreground">{mode.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button onClick={nextStep}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>
                Enter the details for your {selectedPaymentMode?.name} payment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="e.g. 254700000000"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the phone number registered with M-PESA
                    </p>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="remarks">Remarks (Optional)</Label>
                    <Input
                      id="remarks"
                      placeholder="Add any notes about this payment"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                  </div>
                </div>

                <div className="border rounded-md p-4 bg-muted/50">
                  <h3 className="font-medium mb-2">Payment Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Account:</span>
                      <span>{selectedAccount?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Type:</span>
                      <span className="capitalize">{selectedPaymentType?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span>{selectedPaymentMode?.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Make Payment'}
              </Button>
            </CardFooter>
          </Card>
        );

      case 5:
        return (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-center mb-1">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <CardTitle className="text-center text-lg">Payment Initiated!</CardTitle>
              <CardDescription className="text-center text-xs">
                {selectedPaymentMode?.name === 'M-PESA' ? 
                  'Please check your phone for the M-PESA prompt to complete the payment.' :
                  'Your payment has been recorded successfully.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="border rounded-md p-3 bg-muted/30">
                <h3 className="font-medium text-sm mb-2">Payment Details</h3>
                <div className="grid gap-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account:</span>
                    <span className="font-medium">{selectedAccount?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">${amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span className="font-medium">{selectedPaymentMode?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reference:</span>
                    <span className="font-medium text-primary">{paymentReference}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button 
                onClick={() => window.location.href = '/user/dashboard'}
                size="sm"
                className="mx-auto"
              >
                Return to Dashboard
              </Button>
            </CardFooter>
          </Card>
        );

      default:
        return (
          <Card className="shadow-sm">
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                <p>Loading payment interface...</p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <UserDashboardLayout>
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Make a Payment</h1>
            <p className="text-sm text-muted-foreground">Follow the steps below to make a payment to your account</p>
          </div>
        </div>
        
        <div className="mb-4 bg-card rounded-md p-2 border">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((step) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      currentStep === step 
                        ? 'bg-primary text-primary-foreground' 
                        : currentStep > step 
                          ? 'bg-primary/80 text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step}
                  </div>
                  <span className="text-[10px] mt-1 text-muted-foreground hidden md:inline">
                    {step === 1 && 'Account'}
                    {step === 2 && 'Type'}
                    {step === 3 && 'Method'}
                    {step === 4 && 'Details'}
                    {step === 5 && 'Complete'}
                  </span>
                </div>
                {step < 5 && (
                  <div 
                    className={`flex-1 h-0.5 mx-1 ${
                      currentStep > step ? 'bg-primary/80' : 'bg-muted'
                    }`}
                  ></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {renderStep()}
      </div>
    </UserDashboardLayout>
  );
};

export default Payments;
