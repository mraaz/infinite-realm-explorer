// src/utils/guestUtils.ts

export const isGuestMode = (isLoggedIn: boolean): boolean => {
  if (isLoggedIn) {
    return false; // If the user is logged in, they are not a guest, regardless of URL param
  }
  if (typeof window === "undefined") return false;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("guest") === "true";
};
