export const clearPurchaseAndBillingSession = () => {
  const keysToDelete: string[] = [];

  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (!key) continue;

    if (key.startsWith("purchaseState_") || key.startsWith("billingInfo_")) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => sessionStorage.removeItem(key));
};