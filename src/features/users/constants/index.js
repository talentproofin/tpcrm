export const USER_ERROR_CODES = {
  NOT_FOUND: "USER_NOT_FOUND",
  VALIDATION: "USER_VALIDATION",
  FORBIDDEN: "USER_FORBIDDEN",
  DUPLICATE_EMAIL: "USER_DUPLICATE_EMAIL",
  UNKNOWN: "USER_UNKNOWN",
};

export const USER_STATUS_CODES = {
  INVITED: "invited",
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
};

export const USER_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
  { value: "invited", label: "Invited" },
];

export const USER_MANAGEMENT_ACCESS_ROLE_CODES = ["admin", "ceo", "manager"];

export const USER_MANAGEMENT_WRITE_ROLE_CODES = ["admin"];

export const MANAGER_ASSIGNABLE_ROLE_CODES = ["admin", "manager"];

export const DEFAULT_PAGE_SIZE = 20;
