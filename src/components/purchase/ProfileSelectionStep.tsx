// import React, { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Badge } from "@/components/ui/badge";
// import { User, Users, Plus, CheckCircle } from "lucide-react";
// import { APIUserProfileResponse } from "@/api/models/userInfo.model";

// interface ProfileSelectionStepProps {
//   existingProfiles: APIUserProfileResponse[];
//   selectedProfileIds: string[];
//   onProfileSelection: (profileIds: string[]) => void;
//   onAddNewProfile: () => void;
//   onContinue: () => void;
// }

// const ProfileSelectionStep: React.FC<ProfileSelectionStepProps> = ({
//   existingProfiles,
//   selectedProfileIds,
//   onProfileSelection,
//   onAddNewProfile,
//   onContinue,
// }) => {
//   const [localSelectedIds, setLocalSelectedIds] =
//     useState<string[]>(selectedProfileIds);

//   useEffect(() => {
//     setLocalSelectedIds(selectedProfileIds);
//   }, [selectedProfileIds]);

//   const handleProfileToggle = (profileId: string) => {
//     const newSelectedIds = localSelectedIds.includes(profileId)
//       ? localSelectedIds.filter((id) => id !== profileId)
//       : [...localSelectedIds, profileId];

//     setLocalSelectedIds(newSelectedIds);
//     onProfileSelection(newSelectedIds);
//   };

//   const handleContinue = () => {
//     if (localSelectedIds.length > 0) {
//       onContinue();
//     }
//   };

//   const getVerificationBadge = (status: string) => {
//     switch (status) {
//       case "verified":
//         return (
//           <Badge variant="default" className="bg-green-100 text-green-800">
//             Verified
//           </Badge>
//         );
//       case "pending":
//         return (
//           <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
//             Pending
//           </Badge>
//         );
//       case "rejected":
//         return <Badge variant="destructive">Rejected</Badge>;
//       default:
//         return <Badge variant="secondary">Unknown</Badge>;
//     }
//   };

//   const getUserTypeBadge = (userType: string) => {
//     switch (userType) {
//       case "individual":
//         return (
//           <Badge variant="outline" className="bg-blue-50 text-blue-700">
//             Individual
//           </Badge>
//         );
//       case "business":
//         return (
//           <Badge variant="outline" className="bg-purple-50 text-purple-700">
//             Business
//           </Badge>
//         );
//       case "NRI":
//         return (
//           <Badge variant="outline" className="bg-orange-50 text-orange-700">
//             NRI
//           </Badge>
//         );
//       default:
//         return <Badge variant="outline">{userType}</Badge>;
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Users className="w-6 h-6" />
//             Select Account Holders
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <p className="text-muted-foreground mb-6">
//             Choose from your existing profiles or add new account holders for
//             this investment. Select one primary account holder and optionally
//             add joint holders.
//           </p>

//           {/* Existing Profiles */}
//           <div className="space-y-4 mb-6">
//             <h3 className="font-semibold text-lg">Your Existing Profiles</h3>
//             {existingProfiles.length === 0 ? (
//               <Card className="border-dashed">
//                 <CardContent className="py-8 text-center">
//                   <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
//                   <p className="text-muted-foreground mb-4">
//                     No existing profiles found
//                   </p>
//                 </CardContent>
//               </Card>
//             ) : (
//               <div className="grid gap-4">
//                 {existingProfiles.map((profile) => (
//                   <Card
//                     key={profile.user_profile_id}
//                     className={`cursor-pointer transition-all hover:shadow-md ${
//                       localSelectedIds.includes(profile.user_profile_id)
//                         ? "border-primary ring-2 ring-primary/20"
//                         : ""
//                     }`}
//                     onClick={() => handleProfileToggle(profile.user_profile_id)}
//                   >
//                     <CardContent className="p-4">
//                       <div className="flex items-start gap-4">
//                         <Checkbox
//                           checked={localSelectedIds.includes(
//                             profile.user_profile_id
//                           )}
//                           onCheckedChange={() =>
//                             handleProfileToggle(profile.user_profile_id)
//                           }
//                           className="mt-1"
//                         />
//                         <div className="flex-1">
//                           <div className="flex items-center gap-3 mb-2">
//                             <h4 className="font-semibold text-lg">
//                               {profile.surname} {profile.name}
//                             </h4>
//                             {getUserTypeBadge(profile.user_type)}
//                             {getVerificationBadge(
//                               profile.kyc_verification_status
//                             )}
//                           </div>

//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
//                             <div className="flex items-center gap-2">
//                               <span className="font-medium">Email:</span>
//                               <span>{profile.email}</span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                               <span className="font-medium">Phone:</span>
//                               <span>{profile.phone_number}</span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                               <span className="font-medium">PAN:</span>
//                               <span>
//                                 {profile.pan_number || "Not provided"}
//                               </span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                               <span className="font-medium">Aadhaar:</span>
//                               <span>
//                                 {profile.aadhar_number || "Not provided"}
//                               </span>
//                             </div>
//                           </div>

//                           {profile.kyc_verification_status === "verified" && (
//                             <div className="flex items-center gap-2 mt-2 text-green-600">
//                               <CheckCircle className="w-4 h-4" />
//                               <span className="text-sm font-medium">
//                                 KYC Verified
//                               </span>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Add New Profile Button */}
//           <div className="border-t pt-6">
//             <Button
//               variant="outline"
//               onClick={onAddNewProfile}
//               className="w-full border-dashed"
//             >
//               <Plus className="w-4 h-4 mr-2" />
//               Add New Account Holder
//             </Button>
//           </div>

//           {/* Selection Info */}
//           {localSelectedIds.length > 0 && (
//             <div className="mt-6 p-4 bg-blue-50 rounded-lg">
//               <div className="flex items-center gap-2 text-blue-800">
//                 <CheckCircle className="w-5 h-5" />
//                 <span className="font-medium">
//                   {localSelectedIds.length} profile
//                   {localSelectedIds.length > 1 ? "s" : ""} selected
//                 </span>
//               </div>
//               <p className="text-blue-700 text-sm mt-1">
//                 {localSelectedIds.length === 1
//                   ? "This profile will be the primary account holder."
//                   : `The first selected profile will be the primary account holder,
//                      and the others will be joint holders.`}
//               </p>
//             </div>
//           )}

//           {/* Continue Button */}
//           <div className="mt-6">
//             <Button
//               onClick={handleContinue}
//               disabled={localSelectedIds.length === 0}
//               className="w-full"
//             >
//               Continue to Payment
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default ProfileSelectionStep;
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

          {/* Existing Profiles */}
          {/* <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-lg">Your Existing Profiles</h3>
            {existingProfiles.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No existing profiles found
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {existingProfiles.map((profile) => (
                  <Card
                    key={profile.user_profile_id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      localSelectedIds.includes(profile.user_profile_id)
                        ? "border-primary ring-2 ring-primary/20"
                        : ""
                    }`}
                    onClick={() => handleProfileToggle(profile.user_profile_id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={localSelectedIds.includes(
                            profile.user_profile_id
                          )}
                          onCheckedChange={() =>
                            handleProfileToggle(profile.user_profile_id)
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-lg">
                              {profile.surname} {profile.name}
                            </h4>
                            {getUserTypeBadge(profile.user_type)}
                            {getVerificationBadge(
                              profile.kyc_verification_status
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Email:</span>
                              <span>{profile.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Phone:</span>
                              <span>{profile.phone_number}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">PAN:</span>
                              <span>
                                {profile.pan_number || "Not provided"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Aadhaar:</span>
                              <span>
                                {profile.aadhar_number || "Not provided"}
                              </span>
                            </div>
                          </div>

                          {profile.kyc_verification_status === "verified" && (
                            <div className="flex items-center gap-2 mt-2 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                KYC Verified
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div> */}

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
