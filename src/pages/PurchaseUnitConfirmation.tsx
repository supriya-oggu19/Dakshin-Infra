import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, AlertCircle, Building, FileText, Users, IndianRupee } from "lucide-react";

interface Project {
  id: string;
  name: string;
  project_code: string;
  location: string;
  base_price: number;
}

interface Scheme {
  id: string;
  name: string;
  scheme_type: string;
  area_sqft: number;
  total_installments: number;
  monthly_installment_amount: number;
  booking_advance: number;
}

interface PurchaseUnitConfirmationProps {
  projectId: string;
  schemeId: string;
  isJointOwnership: boolean;
  numberOfUnits: number;
  onPurchaseSuccess: (data: any) => void;
  userProfileId?: string;
}

interface PurchaseUnitResponse {
  message: string;
  data: {
    id: string;
    unit_number: string;
    floor_number: number;
    created_at: string;
  };
}

const PurchaseUnitConfirmation = ({
  projectId,
  schemeId,
  isJointOwnership,
  numberOfUnits,
  onPurchaseSuccess,
  userProfileId
}: PurchaseUnitConfirmationProps) => {
  const { toast } = useToast();
  const { getToken, user } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');

  // Format currency function
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Fetch project and scheme details
  useEffect(() => {
    const fetchProjectAndScheme = async () => {
      const token = getToken();
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Try multiple possible endpoints for project details
        let projectResponse;
        let projectData;
        
        // Try endpoint 1: /api/projects/{id}
        try {
          projectResponse = await fetch(`http://127.0.0.1:8000/api/projects/${projectId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (projectResponse.ok) {
            projectData = await projectResponse.json();
            setProject(projectData.data || projectData);
          } else if (projectResponse.status === 405) {
            // Try endpoint 2: /api/project/{id} (different endpoint structure)
            projectResponse = await fetch(`http://127.0.0.1:8000/api/project/${projectId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            
            if (projectResponse.ok) {
              projectData = await projectResponse.json();
              setProject(projectData.data || projectData);
            } else {
              throw new Error('Failed to fetch project details');
            }
          } else {
            throw new Error('Failed to fetch project details');
          }
        } catch (projectError) {
          console.error('Project fetch error:', projectError);
          // If all endpoints fail, create a mock project object with basic info
          setProject({
            id: projectId,
            name: "Kapil Business Park",
            project_code: "KBP",
            location: "Hyderabad",
            base_price: 5000000 // Default base price
          });
        }

        // Fetch scheme details
        let schemeResponse;
        let schemeData;
        
        try {
          schemeResponse = await fetch(`http://127.0.0.1:8000/api/schemes/${schemeId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (schemeResponse.ok) {
            schemeData = await schemeResponse.json();
            setScheme(schemeData.data || schemeData);
          } else if (schemeResponse.status === 405) {
            // Try alternative scheme endpoint
            schemeResponse = await fetch(`http://127.0.0.1:8000/api/scheme/${schemeId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            
            if (schemeResponse.ok) {
              schemeData = await schemeResponse.json();
              setScheme(schemeData.data || schemeData);
            } else {
              throw new Error('Failed to fetch scheme details');
            }
          } else {
            throw new Error('Failed to fetch scheme details');
          }
        } catch (schemeError) {
          console.error('Scheme fetch error:', schemeError);
          // Create a mock scheme object with basic info
          setScheme({
            id: schemeId,
            name: "Standard Scheme",
            scheme_type: "single_payment",
            area_sqft: 1000,
            total_installments: 0,
            monthly_installment_amount: 0,
            booking_advance: 500000
          });
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load some details, but you can still proceed with purchase');
        toast({
          title: 'Warning',
          description: 'Some details could not be loaded, but purchase can proceed',
          variant: 'default',
        });
      } finally {
        setLoading(false);
      }
    };

    if (projectId && schemeId) {
      fetchProjectAndScheme();
    }
  }, [projectId, schemeId, getToken, toast]);

  const handleConfirmPurchase = async () => {
    const token = getToken();
    if (!token) {
      toast({
        title: 'Error',
        description: 'Please log in again',
        variant: 'destructive',
      });
      return;
    }

    setPurchasing(true);
    try {
      const requestBody: any = {
        project_id: projectId,
        scheme_id: schemeId,
        is_joint_ownership: isJointOwnership,
        number_of_units: numberOfUnits,
      };

      // Add user_profile_id if available
      if (userProfileId) {
        requestBody.user_profile_id = userProfileId;
      }

      console.log('Sending purchase request:', requestBody);

      const response = await fetch('http://127.0.0.1:8000/api/purchased-unit/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data: PurchaseUnitResponse = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: data.message,
          variant: 'default',
        });
        onPurchaseSuccess(data.data);
      } else {
        throw new Error(data.message || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to confirm purchase',
        variant: 'destructive',
      });
    } finally {
      setPurchasing(false);
    }
  };

  // Calculate investment details
  const calculateInvestment = () => {
    if (!scheme) return null;

    const basePrice = project?.base_price || 5000000; // Default base price
    const areaPerUnit = scheme.area_sqft || 0;
    const totalArea = areaPerUnit * numberOfUnits;

    if (scheme.scheme_type === 'single_payment') {
      const totalInvestment = basePrice * numberOfUnits;
      return {
        type: 'Single Payment',
        totalInvestment,
        breakdown: [
          { label: 'Base Price per Unit', value: basePrice },
          { label: 'Number of Units', value: numberOfUnits },
          { label: 'Total Area', value: `${totalArea} sqft` },
        ]
      };
    } else {
      const monthlyAmount = scheme.monthly_installment_amount || 0;
      const totalInstallments = scheme.total_installments || 0;
      const bookingAdvance = scheme.booking_advance || 0;
      const totalInvestment = (bookingAdvance + monthlyAmount * totalInstallments) * numberOfUnits;

      return {
        type: 'Installment Plan',
        totalInvestment,
        breakdown: [
          { label: 'Booking Advance', value: bookingAdvance * numberOfUnits },
          { label: 'Monthly Installment', value: monthlyAmount * numberOfUnits },
          { label: 'Total Installments', value: totalInstallments },
          { label: 'Number of Units', value: numberOfUnits },
          { label: 'Total Area', value: `${totalArea} sqft` },
        ]
      };
    }
  };

  const investmentDetails = calculateInvestment();

  if (loading) {
    return (
      <Card className="border-2 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-lg">Loading purchase details...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-green-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200">
        <CardTitle className="flex items-center gap-2 text-green-800">
          <CheckCircle className="w-6 h-6" />
          Purchase Unit Confirmation
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center text-yellow-800">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Project Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Project Details</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Project Name:</span>
                <span className="font-semibold">{project?.name || 'Kapil Business Park'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Project Code:</span>
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {project?.project_code || 'KBP'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-semibold">{project?.location || 'Hyderabad'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Base Price:</span>
                <span className="font-semibold">{formatCurrency(project?.base_price || 5000000)}</span>
              </div>
            </div>
          </div>

          {/* Scheme Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-800">Scheme Details</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Scheme Name:</span>
                <span className="font-semibold">{scheme?.name || 'Standard Scheme'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Scheme Type:</span>
                <span className="font-semibold capitalize">
                  {scheme?.scheme_type?.replace('_', ' ') || 'single payment'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Area per Unit:</span>
                <span className="font-semibold">{scheme?.area_sqft || 1000} sqft</span>
              </div>
              {scheme?.scheme_type === 'installment' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Installments:</span>
                    <span className="font-semibold">{scheme.total_installments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Installment:</span>
                    <span className="font-semibold">{formatCurrency(scheme.monthly_installment_amount || 0)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Ownership and Units */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-800">Ownership Details</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Ownership Type:</span>
                <span className="font-semibold">
                  {isJointOwnership ? 'Joint Ownership' : 'Single Ownership'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Number of Units:</span>
                <span className="font-semibold">{numberOfUnits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Area:</span>
                <span className="font-semibold">{((scheme?.area_sqft || 1000) * numberOfUnits).toLocaleString()} sqft</span>
              </div>
            </div>
          </div>

          {/* Investment Summary */}
          {investmentDetails && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <IndianRupee className="w-5 h-5" />
                Investment Summary
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Type:</span>
                  <span className="font-semibold">{investmentDetails.type}</span>
                </div>
                {investmentDetails.breakdown.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-600">{item.label}:</span>
                    <span className="font-semibold">
                      {typeof item.value === 'number' ? formatCurrency(item.value) : item.value}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-2">
                  <span className="text-lg font-bold text-gray-800">Total Investment:</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(investmentDetails.totalInvestment)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Information Summary */}
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800">User Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-gray-600">Name:</span>
              <p className="font-medium">{user?.name || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Email:</span>
              <p className="font-medium">{user?.email || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Phone:</span>
              <p className="font-medium">{user?.phone_number || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleConfirmPurchase}
            disabled={purchasing}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold"
            size="lg"
          >
            {purchasing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Confirm Purchase Unit
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PurchaseUnitConfirmation;