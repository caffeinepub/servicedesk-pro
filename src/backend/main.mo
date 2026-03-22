import Debug "mo:core/Debug";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import UserApproval "user-approval/approval";
import AccessControl "authorization/access-control";
import Array "mo:base/Array";
import Nat "mo:base/Nat";

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

  // ─── Custom User Management ───────────────────────────────────────────────

  public type SdUser = {
    id : Text;
    name : Text;
    email : Text;
    password : Text;
    phone : Text;
    role : Text;
    status : Text;
    createdAt : Text;
    lastLogin : Text;
  };

  stable var sdUsers : [SdUser] = [];
  stable var sdUserCounter : Nat = 100;

  func nextSdUserId() : Text {
    sdUserCounter += 1;
    "sd" # Nat.toText(sdUserCounter);
  };

  // Initialize seed users if none exist
  public func initSeedUsers() : async () {
    if (sdUsers.size() == 0) {
      sdUsers := [
        { id = "u1"; name = "Admin"; email = "kumardsemail@gmail.com"; password = "Admin@123"; phone = ""; role = "admin"; status = "approved"; createdAt = "2025-01-01"; lastLogin = "" },
        { id = "u2"; name = "Rahul Verma"; email = "rahul@servicedesk.com"; password = "User@123"; phone = "9876543210"; role = "backend_user"; status = "approved"; createdAt = "2025-01-01"; lastLogin = "" },
        { id = "u3"; name = "Supervisor"; email = "supervisor@servicedesk.com"; password = "Super@123"; phone = "9876543211"; role = "supervisor"; status = "approved"; createdAt = "2025-01-01"; lastLogin = "" },
      ];
    };
  };

  // Get all users
  public query func getSdUsers() : async [SdUser] {
    sdUsers;
  };

  // Verify login credentials
  public query func loginSdUser(email : Text, password : Text) : async ?SdUser {
    var found : ?SdUser = null;
    for (u in sdUsers.vals()) {
      if (u.email == email and u.password == password and u.status == "approved") {
        found := ?u;
      };
    };
    found;
  };

  // Create a user with a given ID (admin creates, status approved)
  public func createSdUser(id : Text, name : Text, email : Text, password : Text, phone : Text, role : Text, status : Text, createdAt : Text) : async SdUser {
    let newId = if (id == "") { nextSdUserId() } else { id };
    let user : SdUser = { id = newId; name; email; password; phone; role; status; createdAt; lastLogin = "" };
    sdUsers := Array.append(sdUsers, [user]);
    user;
  };

  // Approve a user
  public func approveSdUser(userId : Text) : async () {
    sdUsers := Array.map<SdUser, SdUser>(sdUsers, func(u) {
      if (u.id == userId) {
        { id = u.id; name = u.name; email = u.email; password = u.password; phone = u.phone; role = u.role; status = "approved"; createdAt = u.createdAt; lastLogin = u.lastLogin };
      } else { u };
    });
  };

  // Reject a user
  public func rejectSdUser(userId : Text) : async () {
    sdUsers := Array.map<SdUser, SdUser>(sdUsers, func(u) {
      if (u.id == userId) {
        { id = u.id; name = u.name; email = u.email; password = u.password; phone = u.phone; role = u.role; status = "rejected"; createdAt = u.createdAt; lastLogin = u.lastLogin };
      } else { u };
    });
  };

  // Edit a user (empty password keeps existing)
  public func editSdUser(userId : Text, name : Text, email : Text, phone : Text, role : Text, password : Text) : async () {
    sdUsers := Array.map<SdUser, SdUser>(sdUsers, func(u) {
      if (u.id == userId) {
        let newPwd = if (password == "") { u.password } else { password };
        { id = u.id; name; email; password = newPwd; phone; role; status = u.status; createdAt = u.createdAt; lastLogin = u.lastLogin };
      } else { u };
    });
  };

  // Delete a user
  public func deleteSdUser(userId : Text) : async () {
    sdUsers := Array.filter<SdUser>(sdUsers, func(u) { u.id != userId });
  };

  // Update last login time
  public func updateSdUserLogin(userId : Text, loginTime : Text) : async () {
    sdUsers := Array.map<SdUser, SdUser>(sdUsers, func(u) {
      if (u.id == userId) {
        { id = u.id; name = u.name; email = u.email; password = u.password; phone = u.phone; role = u.role; status = u.status; createdAt = u.createdAt; lastLogin = loginTime };
      } else { u };
    });
  };
};
