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
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  let approvalState = UserApproval.initState(accessControlState);

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
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };

  public shared ({ caller }) func initializeSystem() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can initialize system");
    };
    Debug.print("System initialized.");
  };

  // ─── Custom User Management ────────────────────────────────────────

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

  public func initSeedUsers() : async () {
    let adminExists = Array.find(sdUsers, func(u : SdUser) : Bool {
      Text.toLowercase(u.email) == "kumardsemail@gmail.com" and u.role == "admin"
    });
    if (adminExists == null) {
      let cleaned = Array.filter(sdUsers, func(u : SdUser) : Bool {
        Text.toLowercase(u.email) != "rahul@servicedesk.com" and
        Text.toLowercase(u.email) != "supervisor@servicedesk.com"
      });
      sdUsers := Array.append(cleaned, [
        { id = "u1"; name = "Admin"; email = "kumardsemail@gmail.com"; password = "Admin@123";
          phone = ""; role = "admin"; status = "approved"; createdAt = "2025-01-01"; lastLogin = "" }
      ]);
    };
  };

  public query func getSdUsers() : async [SdUser] { sdUsers };

  public query func loginSdUser(email : Text, password : Text) : async ?SdUser {
    var found : ?SdUser = null;
    for (u in sdUsers.vals()) {
      if (Text.toLowercase(u.email) == Text.toLowercase(email)
          and u.password == password and u.status == "approved") {
        found := ?u;
      };
    };
    found;
  };

  public func createSdUser(id : Text, name : Text, email : Text, password : Text,
      phone : Text, role : Text, status : Text, createdAt : Text) : async SdUser {
    let newId = if (id == "") { nextSdUserId() } else { id };
    let user : SdUser = { id = newId; name; email; password; phone; role; status; createdAt; lastLogin = "" };
    sdUsers := Array.append(sdUsers, [user]);
    user;
  };

  public func approveSdUser(userId : Text) : async () {
    sdUsers := Array.map<SdUser, SdUser>(sdUsers, func(u) {
      if (u.id == userId) { { id=u.id; name=u.name; email=u.email; password=u.password;
        phone=u.phone; role=u.role; status="approved"; createdAt=u.createdAt; lastLogin=u.lastLogin } }
      else { u };
    });
  };

  public func rejectSdUser(userId : Text) : async () {
    sdUsers := Array.map<SdUser, SdUser>(sdUsers, func(u) {
      if (u.id == userId) { { id=u.id; name=u.name; email=u.email; password=u.password;
        phone=u.phone; role=u.role; status="rejected"; createdAt=u.createdAt; lastLogin=u.lastLogin } }
      else { u };
    });
  };

  public func editSdUser(userId : Text, name : Text, email : Text,
      phone : Text, role : Text, password : Text) : async () {
    sdUsers := Array.map<SdUser, SdUser>(sdUsers, func(u) {
      if (u.id == userId) {
        let newPwd = if (password == "") { u.password } else { password };
        { id=u.id; name; email; password=newPwd; phone; role; status=u.status;
          createdAt=u.createdAt; lastLogin=u.lastLogin }
      } else { u };
    });
  };

  public func deleteSdUser(userId : Text) : async () {
    sdUsers := Array.filter(sdUsers, func(u : SdUser) : Bool { u.id != userId });
  };

  public func updateSdUserLogin(userId : Text, loginTime : Text) : async () {
    sdUsers := Array.map<SdUser, SdUser>(sdUsers, func(u) {
      if (u.id == userId) { { id=u.id; name=u.name; email=u.email; password=u.password;
        phone=u.phone; role=u.role; status=u.status; createdAt=u.createdAt; lastLogin=loginTime } }
      else { u };
    });
  };

  // ─── Part Requests ────────────────────────────────────────────────────

  // V1 type: what is currently in stable memory (no priority/cancelled fields)
  type SdPartRequestV1 = {
    id : Text; caseId : Text; caseDbId : Text; customerName : Text;
    partName : Text; partCode : Text; partPhotoUrl : Text;
    requestedBy : Text; requestedByName : Text; requestedAt : Text;
    status : Text; technicianId : Text; issuedAt : Text;
    issuedBy : Text; issuedByName : Text; rejectedReason : Text;
    rejectedAt : Text; rejectedBy : Text; rejectedByName : Text;
    message : Text; productType : Text; companyName : Text;
  };

  // New full type
  public type SdPartRequest = {
    id : Text; caseId : Text; caseDbId : Text; customerName : Text;
    partName : Text; partCode : Text; partPhotoUrl : Text;
    requestedBy : Text; requestedByName : Text; requestedAt : Text;
    status : Text; technicianId : Text; issuedAt : Text;
    issuedBy : Text; issuedByName : Text; rejectedReason : Text;
    rejectedAt : Text; rejectedBy : Text; rejectedByName : Text;
    message : Text; productType : Text; companyName : Text;
    priority : Text; cancelledBy : Text; cancelledByName : Text; cancelledAt : Text;
  };

  // Keep old stable var name so Motoko can deserialise existing stable memory
  stable var sdPartRequests : [SdPartRequestV1] = [];
  // New stable var with full type
  stable var sdPartRequestsV2 : [SdPartRequest] = [];
  stable var sdPartReqMigrated : Bool = false;
  stable var sdPartReqCounter : Nat = 0;

  // Migrate V1 → V2 once on first upgrade
  system func postupgrade() {
    if (not sdPartReqMigrated) {
      sdPartRequestsV2 := Array.map<SdPartRequestV1, SdPartRequest>(sdPartRequests, func(r) {
        { id=r.id; caseId=r.caseId; caseDbId=r.caseDbId; customerName=r.customerName;
          partName=r.partName; partCode=r.partCode; partPhotoUrl=r.partPhotoUrl;
          requestedBy=r.requestedBy; requestedByName=r.requestedByName; requestedAt=r.requestedAt;
          status=r.status; technicianId=r.technicianId; issuedAt=r.issuedAt;
          issuedBy=r.issuedBy; issuedByName=r.issuedByName; rejectedReason=r.rejectedReason;
          rejectedAt=r.rejectedAt; rejectedBy=r.rejectedBy; rejectedByName=r.rejectedByName;
          message=r.message; productType=r.productType; companyName=r.companyName;
          priority="normal"; cancelledBy=""; cancelledByName=""; cancelledAt="";
        };
      });
      sdPartRequests := [];
      sdPartReqMigrated := true;
    };
  };

  func nextPartReqId() : Text {
    sdPartReqCounter += 1;
    "pr" # Nat.toText(sdPartReqCounter);
  };

  public query func getSdPartRequests() : async [SdPartRequest] {
    sdPartRequestsV2;
  };

  public func createSdPartRequest(
    id : Text, caseId : Text, caseDbId : Text, customerName : Text,
    partName : Text, partCode : Text, partPhotoUrl : Text,
    requestedBy : Text, requestedByName : Text, requestedAt : Text,
    message : Text, productType : Text, companyName : Text, priority : Text
  ) : async SdPartRequest {
    let newId = if (id == "") { nextPartReqId() } else { id };
    let req : SdPartRequest = {
      id=newId; caseId; caseDbId; customerName; partName; partCode; partPhotoUrl;
      requestedBy; requestedByName; requestedAt; status="pending";
      technicianId=""; issuedAt=""; issuedBy=""; issuedByName="";
      rejectedReason=""; rejectedAt=""; rejectedBy=""; rejectedByName="";
      message; productType; companyName; priority;
      cancelledBy=""; cancelledByName=""; cancelledAt="";
    };
    sdPartRequestsV2 := Array.append(sdPartRequestsV2, [req]);
    req;
  };

  public func issueSdPartRequest(id : Text, technicianId : Text,
      issuedAt : Text, issuedBy : Text, issuedByName : Text) : async () {
    sdPartRequestsV2 := Array.map<SdPartRequest, SdPartRequest>(sdPartRequestsV2, func(r) {
      if (r.id == id) {
        { id=r.id; caseId=r.caseId; caseDbId=r.caseDbId; customerName=r.customerName;
          partName=r.partName; partCode=r.partCode; partPhotoUrl=r.partPhotoUrl;
          requestedBy=r.requestedBy; requestedByName=r.requestedByName; requestedAt=r.requestedAt;
          status="issued"; technicianId; issuedAt; issuedBy; issuedByName;
          rejectedReason=r.rejectedReason; rejectedAt=r.rejectedAt;
          rejectedBy=r.rejectedBy; rejectedByName=r.rejectedByName;
          message=r.message; productType=r.productType; companyName=r.companyName;
          priority=r.priority; cancelledBy=r.cancelledBy;
          cancelledByName=r.cancelledByName; cancelledAt=r.cancelledAt;
        };
      } else { r };
    });
  };

  public func rejectSdPartRequest(id : Text, reason : Text,
      rejectedAt : Text, rejectedBy : Text, rejectedByName : Text) : async () {
    sdPartRequestsV2 := Array.map<SdPartRequest, SdPartRequest>(sdPartRequestsV2, func(r) {
      if (r.id == id) {
        { id=r.id; caseId=r.caseId; caseDbId=r.caseDbId; customerName=r.customerName;
          partName=r.partName; partCode=r.partCode; partPhotoUrl=r.partPhotoUrl;
          requestedBy=r.requestedBy; requestedByName=r.requestedByName; requestedAt=r.requestedAt;
          status="rejected"; technicianId=r.technicianId; issuedAt=r.issuedAt;
          issuedBy=r.issuedBy; issuedByName=r.issuedByName;
          rejectedReason=reason; rejectedAt; rejectedBy; rejectedByName;
          message=r.message; productType=r.productType; companyName=r.companyName;
          priority=r.priority; cancelledBy=r.cancelledBy;
          cancelledByName=r.cancelledByName; cancelledAt=r.cancelledAt;
        };
      } else { r };
    });
  };

  public func deleteSdPartRequest(id : Text) : async () {
    sdPartRequestsV2 := Array.filter(sdPartRequestsV2,
      func(r : SdPartRequest) : Bool { r.id != id });
  };

  public func cancelSdPartRequest(id : Text,
      cancelledBy : Text, cancelledByName : Text, cancelledAt : Text) : async () {
    sdPartRequestsV2 := Array.map<SdPartRequest, SdPartRequest>(sdPartRequestsV2, func(r) {
      if (r.id == id) {
        { id=r.id; caseId=r.caseId; caseDbId=r.caseDbId; customerName=r.customerName;
          partName=r.partName; partCode=r.partCode; partPhotoUrl=r.partPhotoUrl;
          requestedBy=r.requestedBy; requestedByName=r.requestedByName; requestedAt=r.requestedAt;
          status="cancelled"; technicianId=r.technicianId; issuedAt=r.issuedAt;
          issuedBy=r.issuedBy; issuedByName=r.issuedByName;
          rejectedReason=r.rejectedReason; rejectedAt=r.rejectedAt;
          rejectedBy=r.rejectedBy; rejectedByName=r.rejectedByName;
          message=r.message; productType=r.productType; companyName=r.companyName;
          priority=r.priority; cancelledBy; cancelledByName; cancelledAt;
        };
      } else { r };
    });
  };

  // ─── JSON Blob Storage ─────────────────────────────────────────────────

  // Keep [Text] type to stay compatible with existing stable memory
  stable var sdCasesJson : [Text] = [];
  stable var sdNoticesJson : [Text] = [];
  // New blobs (no previous stable vars for these)
  stable var sdInventoryJson : Text = "{}";
  stable var sdAppDataJson : Text = "{}";

  public func setSdCases(jsonBlob : Text) : async () {
    sdCasesJson := [jsonBlob];
  };
  public query func getSdCasesJson() : async Text {
    if (sdCasesJson.size() == 0) { return "[]" };
    sdCasesJson[0];
  };

  public func setSdNotices(jsonBlob : Text) : async () {
    sdNoticesJson := [jsonBlob];
  };
  public query func getSdNoticesJson() : async Text {
    if (sdNoticesJson.size() == 0) { return "[]" };
    sdNoticesJson[0];
  };

  public func setSdInventory(jsonBlob : Text) : async () {
    sdInventoryJson := jsonBlob;
  };
  public query func getSdInventoryJson() : async Text { sdInventoryJson };

  public func setSdAppData(jsonBlob : Text) : async () {
    sdAppDataJson := jsonBlob;
  };
  public query func getSdAppDataJson() : async Text { sdAppDataJson };

  stable var sdPartRequestsJson : Text = "[]";

  public func setSdPartRequestsJson(jsonBlob : Text) : async () {
    sdPartRequestsJson := jsonBlob;
  };
  public query func getSdPartRequestsJson() : async Text { sdPartRequestsJson };

};
