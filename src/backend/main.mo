import Debug "mo:core/Debug";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import UserApproval "user-approval/approval";
import AccessControl "authorization/access-control";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Text "mo:base/Text";

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

  var sdUsers : [SdUser] = [];
  var sdUserCounter : Nat = 100;

  func nextSdUserId() : Text {
    sdUserCounter += 1;
    "sd" # Nat.toText(sdUserCounter);
  };

  // Initialize seed users if none exist — only seeds admin
  public func initSeedUsers() : async () {
    let adminExists = Array.find(sdUsers, func(u : SdUser) : Bool {
      Text.toLowercase(u.email) == "kumardsemail@gmail.com" and u.role == "admin"
    });
    if (adminExists == null) {
      let nonSeedUsers = Array.filter(sdUsers, func(u : SdUser) : Bool {
        Text.toLowercase(u.email) != "rahul@servicedesk.com" and
        Text.toLowercase(u.email) != "supervisor@servicedesk.com"
      });
      sdUsers := Array.append(nonSeedUsers, [
        { id = "u1"; name = "Admin"; email = "kumardsemail@gmail.com"; password = "Admin@123"; phone = ""; role = "admin"; status = "approved"; createdAt = "2025-01-01"; lastLogin = "" }
      ]);
    };
  };

  // Get all users
  public query func getSdUsers() : async [SdUser] {
    sdUsers;
  };

  // Verify login credentials — case-insensitive email match
  public query func loginSdUser(email : Text, password : Text) : async ?SdUser {
    var found : ?SdUser = null;
    for (u in sdUsers.vals()) {
      if (Text.toLowercase(u.email) == Text.toLowercase(email) and u.password == password and u.status == "approved") {
        found := ?u;
      };
    };
    found;
  };

  // Create a user with a given ID
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
    sdUsers := Array.filter(sdUsers, func(u : SdUser) : Bool { u.id != userId });
  };

  // Update last login time
  public func updateSdUserLogin(userId : Text, loginTime : Text) : async () {
    sdUsers := Array.map<SdUser, SdUser>(sdUsers, func(u) {
      if (u.id == userId) {
        { id = u.id; name = u.name; email = u.email; password = u.password; phone = u.phone; role = u.role; status = u.status; createdAt = u.createdAt; lastLogin = loginTime };
      } else { u };
    });
  };

  // ─── Part Requests ───────────────────────────────────────────────────────

  public type SdPartRequest = {
    id : Text;
    caseId : Text;
    caseDbId : Text;
    customerName : Text;
    partName : Text;
    partCode : Text;
    partPhotoUrl : Text;
    requestedBy : Text;
    requestedByName : Text;
    requestedAt : Text;
    status : Text;
    technicianId : Text;
    issuedAt : Text;
    issuedBy : Text;
    issuedByName : Text;
    rejectedReason : Text;
    rejectedAt : Text;
    rejectedBy : Text;
    rejectedByName : Text;
    message : Text;
    productType : Text;
    companyName : Text;
  };

  var sdPartRequests : [SdPartRequest] = [];
  var sdPartReqCounter : Nat = 0;

  func nextPartReqId() : Text {
    sdPartReqCounter += 1;
    "pr" # Nat.toText(sdPartReqCounter);
  };

  // Get all part requests
  public query func getSdPartRequests() : async [SdPartRequest] {
    sdPartRequests;
  };

  // Create a part request
  public func createSdPartRequest(
    id : Text, caseId : Text, caseDbId : Text, customerName : Text,
    partName : Text, partCode : Text, partPhotoUrl : Text,
    requestedBy : Text, requestedByName : Text, requestedAt : Text,
    message : Text, productType : Text, companyName : Text
  ) : async SdPartRequest {
    let newId = if (id == "") { nextPartReqId() } else { id };
    let req : SdPartRequest = {
      id = newId; caseId; caseDbId; customerName; partName; partCode; partPhotoUrl;
      requestedBy; requestedByName; requestedAt; status = "pending";
      technicianId = ""; issuedAt = ""; issuedBy = ""; issuedByName = "";
      rejectedReason = ""; rejectedAt = ""; rejectedBy = ""; rejectedByName = "";
      message; productType; companyName;
    };
    sdPartRequests := Array.append(sdPartRequests, [req]);
    req;
  };

  // Issue a part request
  public func issueSdPartRequest(id : Text, technicianId : Text, issuedAt : Text, issuedBy : Text, issuedByName : Text) : async () {
    sdPartRequests := Array.map<SdPartRequest, SdPartRequest>(sdPartRequests, func(r) {
      if (r.id == id) {
        { id = r.id; caseId = r.caseId; caseDbId = r.caseDbId; customerName = r.customerName;
          partName = r.partName; partCode = r.partCode; partPhotoUrl = r.partPhotoUrl;
          requestedBy = r.requestedBy; requestedByName = r.requestedByName; requestedAt = r.requestedAt;
          status = "issued"; technicianId; issuedAt; issuedBy; issuedByName;
          rejectedReason = r.rejectedReason; rejectedAt = r.rejectedAt; rejectedBy = r.rejectedBy; rejectedByName = r.rejectedByName;
          message = r.message; productType = r.productType; companyName = r.companyName;
        };
      } else { r };
    });
  };

  // Reject a part request
  public func rejectSdPartRequest(id : Text, reason : Text, rejectedAt : Text, rejectedBy : Text, rejectedByName : Text) : async () {
    sdPartRequests := Array.map<SdPartRequest, SdPartRequest>(sdPartRequests, func(r) {
      if (r.id == id) {
        { id = r.id; caseId = r.caseId; caseDbId = r.caseDbId; customerName = r.customerName;
          partName = r.partName; partCode = r.partCode; partPhotoUrl = r.partPhotoUrl;
          requestedBy = r.requestedBy; requestedByName = r.requestedByName; requestedAt = r.requestedAt;
          status = "rejected"; technicianId = r.technicianId; issuedAt = r.issuedAt; issuedBy = r.issuedBy; issuedByName = r.issuedByName;
          rejectedReason = reason; rejectedAt; rejectedBy; rejectedByName;
          message = r.message; productType = r.productType; companyName = r.companyName;
        };
      } else { r };
    });
  };

  // Delete a part request
  public func deleteSdPartRequest(id : Text) : async () {
    sdPartRequests := Array.filter(sdPartRequests, func(r : SdPartRequest) : Bool { r.id != id });
  };
};
