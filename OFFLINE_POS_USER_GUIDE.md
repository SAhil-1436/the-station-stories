# THE STATION STORIES — OFFLINE POS OPERATOR USER GUIDE
## Comprehensive Counter Cashier & Manager Manual

**Target Audience**: Restaurant Cashiers, Counter Operators, Shift Managers  
**Interface**: Desktop / Tablet POS Terminal (`/pos`)  

---

## 1. Starting Your Shift & Terminal Status

### 1.1 Checking Network Status
At the very top of your billing screen, observe the **Network Status Pill**:
- **🟢 Online (Green)**: The counter is connected to the cloud server. Orders are immediately finalized and synchronized.
- **🟠 Offline Mode (Amber)**: The counter has lost internet or cloud connectivity. The system has automatically switched to **Offline-First Mode**. All billing operations continue locally without interruption.

### 1.2 Automatic 24-Hour Offline Lease
When you log in online at the start of your shift:
1. The terminal securely enrolls your device with the server.
2. A cryptographic 24-hour offline lease is automatically issued and stored locally in your browser.
3. This lease permits you to bill customers offline for up to 24 hours without reconnecting to the internet.

---

## 2. Setting Up & Using Your Security PIN

### 2.1 First-Time PIN Setup
1. When your counter first locks, you will be prompted to set a **4-to-6 digit Security PIN**.
2. Enter your desired PIN using the on-screen numeric keypad or your keyboard number keys.
3. Re-enter the same PIN to confirm.
4. Click **Save PIN & Unlock Terminal**. Your PIN is cryptographically derived using PBKDF2-SHA256 (100,000 iterations) and stored securely in local storage.

### 2.2 5-Minute Inactivity Auto-Lock
- If no keyboard or mouse activity is detected for **5 minutes**, the terminal locks automatically to protect customer data and revenue.
- To unlock: Enter your 4-digit PIN on the keypad and click **Unlock Terminal**.
- **Manual Lock**: If stepping away from the counter, click the **Lock** button in the top bar.

---

## 3. Taking Orders While Offline

### 3.1 Adding Dishes to the Order
1. **Search**: Press `/` on your keyboard to instantly focus the search bar. Type any part of a dish name in English or Hindi.
2. **Category Filter**: Click any category pill (e.g. *Burgers, Pizzas, Station Specials*) to filter the menu grid.
3. **Veg / Non-Veg Toggle**: Filter dishes quickly using the Veg (green) and Non-Veg (red) buttons.
4. **Order Type**: Select **Dine-In** or **Takeaway (Parcel)**. For Dine-In, enter the table or cabin reference (e.g. `Table 3`).

### 3.2 Adjusting Cart Items
- Click any item in the right-hand cart to select it.
- Press `+` to increase quantity.
- Press `-` to decrease quantity.
- Press `Del` or `Backspace` to remove the selected item.
- Click the **Notes** icon to attach kitchen preparation instructions (e.g. *"Extra spicy"*, *"No onions"*).

### 3.3 Settlement: Cash Only Rule While Offline
> [!IMPORTANT]
> When the terminal is in **Offline Mode**, settlement is **strictly restricted to CASH**.
> Card terminals and UPI QR codes require real-time bank validation and are disabled to prevent unconfirmed payments.

1. Click **Proceed to Checkout (F4)**.
2. The payment method is locked to **CASH**.
3. Enter the cash received from the customer in the **Cash Tendered** field.
   - The system validates that the tendered amount is greater than or equal to the bill total.
   - The exact change to return to the customer is displayed automatically.
4. Confirm the cash receipt checkbox.
5. Click **Finalize Cash Bill**.

---

## 4. 58mm Thermal Receipts & PDF Generation

Immediately upon finalization:
1. The **Bill Success Modal** displays the provisional reference number (e.g. `OFF-AL01-20261113-0001`) with an **Offline • Pending Sync** tag.
2. Click **Download 58mm PDF**:
   - Generates a continuous-roll 58mm thermal receipt PDF with zero blank pages and crisp typography.
   - Saves to your device as `TSS-BILL-OFF-AL01-20261113-0001.pdf`.
   - Send this PDF to your connected 58mm thermal receipt printer or hand a printed copy to the customer.
3. Click **Start New Order** to clear the cart for the next waiting customer.

---

## 5. Offline Sync Center

Click the **Sync Center** button in the top status bar at any time to inspect synchronization:

- **Unsynced Bills**: Number of offline bills waiting to be uploaded to the cloud.
- **Retry Failures**: Transactions that encountered network drops during sync. The system automatically retries them with exponential backoff.
- **Sync Now**: When internet connectivity returns, click **Sync Now** to immediately synchronize all queued bills.
- **Status Meanings**:
  - `PENDING`: Stored locally, waiting for sync.
  - `SYNCING`: Currently being uploaded to the backend.
  - `SYNCED`: Successfully acknowledged and recorded in the cloud database.
  - `NEEDS_REVIEW`: Requires manager inspection (e.g. terminal enrollment expired).

---

## 6. Daily USB Backup Procedure

At the end of every shift or before turning off the counter terminal:
1. Insert your designated restaurant USB flash drive into the counter computer.
2. In the POS header, click **USB Backup**.
3. Select the **Create Backup** tab.
4. Click **Export Backup**.
5. When your browser prompts you, select your USB flash drive folder.
6. The file is written with an embedded cryptographic SHA-256 checksum (e.g. `TSS-POS-BACKUP-AL01-2026-11-13.json`).
7. Keep the USB drive in the restaurant safe as an immutable audit record.
