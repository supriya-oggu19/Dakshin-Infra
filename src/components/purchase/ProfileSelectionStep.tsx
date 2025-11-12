import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { User, Users, Plus, CheckCircle } from "lucide-react";
import { APIUserProfileResponse } from "@/api/models/userInfo.model";

interface ProfileSelectionStepProps {
  existingProfiles: APIUserProfileResponse[];
  selectedProfileIds: string[];
  onProfileSelection: (profileIds: string[]) => void;
  onAddNewProfile: () => void;
  onContinue: () => void;
}

const ProfileSelectionStep: React.FC<ProfileSelectionStepProps> = ({
  existingProfiles,
  selectedProfileIds,
  onProfileSelection,
  onAddNewProfile,
  onContinue,
}) => {
  const [localSelectedIds, setLocalSelectedIds] =
    useState<string[]>(selectedProfileIds);

  useEffect(() => {
    setLocalSelectedIds(selectedProfileIds);
  }, [selectedProfileIds]);

  const handleProfileToggle = (profileId: string) => {
    const newSelectedIds = localSelectedIds.includes(profileId)
      ? localSelectedIds.filter((id) => id !== profileId)
      : [...localSelectedIds, profileId];

    setLocalSelectedIds(newSelectedIds);
    onProfileSelection(newSelectedIds);
  };

  const handleContinue = () => {
    if (localSelectedIds.length > 0) {
      onContinue();
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getUserTypeBadge = (userType: string) => {
    switch (userType) {
      case "individual":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Individual
          </Badge>
        );
      case "business":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            Business
          </Badge>
        );
      case "NRI":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700">
            NRI
          </Badge>
        );
      default:
        return <Badge variant="outline">{userType}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6" />
            Select Account Holders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Choose from your existing profiles or add new account holders for
            this investment. Select one primary account holder and optionally
            add joint holders.
          </p>

          {/* Add New Profile Button - MOVED TO TOP */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={onAddNewProfile}
              className="w-full border-dashed py-6"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Account Holder
            </Button>
          </div>

          {/* Selection Info */}
          {localSelectedIds.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">
                  {localSelectedIds.length} profile
                  {localSelectedIds.length > 1 ? "s" : ""} selected
                </span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                {localSelectedIds.length === 1
                  ? "This profile will be the primary account holder."
                  : `The first selected profile will be the primary account holder, 
                     and the others will be joint holders.`}
              </p>
            </div>
          )}

          {/* Continue Button */}
          <div className="mt-6">
            <Button
              onClick={handleContinue}
              disabled={localSelectedIds.length === 0}
              className="w-full"
            >
              Continue to Payment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSelectionStep;
