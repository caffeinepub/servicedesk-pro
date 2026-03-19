import Debug "mo:core/Debug";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import UserApproval "user-approval/approval";
import AccessControl "authorization/access-control";

actor {
  // Add storage functionality
  include MixinStorage();

  // Set up authorization and approval systems
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  let approvalState = UserApproval.initState(accessControlState);

  // User Approval Methods
  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    Debug.print("Requesting approval for caller ");
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    Debug.print("Setting approval for user ");
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    Debug.print("Listing all approvals");
    UserApproval.listApprovals(approvalState);
  };

  // System Initialization
  public shared ({ caller }) func initializeSystem() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can initialize system");
    };
    Debug.print("System initialized.");
  };
};
