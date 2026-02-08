# Driver Login Information

## Current Driver Account

### Phone Number
**`07799661026`**

### Password Status
⚠️ **Password is set, but hash unknown**

The driver record exists in the database with a hashed password, but the original password is not stored anywhere.

---

## Options to Login

### Option 1: Reset the Password (Recommended)
Create a new password for the existing driver:

1. **Use the driver registration API** to update the password
2. **Or create a new driver account** with known credentials

### Option 2: Create a Test Driver Account

Register a new driver with known credentials:

**Phone**: `+441234567890`  
**Password**: `driver123`

### Option 3: Try Common Defaults
Try these common password patterns:
- `password123`
- `driver`
- `test`
- `admin`
- `123456`

---

## Testing Driver Login

### Test Endpoint
```bash
POST http://localhost:3001/api/drivers/login
Content-Type: application/json

{
  "phone": "07799661026",
  "password": "your_guessed_password"
}
```

### Manual Test in Browser
1. Navigate to: `http://localhost:3001/driver/login`
2. Enter phone: `07799661026`
3. Try common passwords

---

## Creating a New Test Driver

To create a test driver with known credentials, use:

**API Endpoint**: `POST /api/drivers`

**Request Body**:
```json
{
  "phone": "+441234567890",
  "password": "driver123",
  "vehicleInfo": {
    "type": "Car",
    "model": "Test Vehicle"
  },
  "isAvailable": true
}
```

**Then use these credentials to login:**
- **Phone**: `+441234567890`
- **Password**: `driver123`

---

## Database Location
- **Database**: `prisma/dev.db`
- **Driver Table**: `drivers`
- **Driver Email**: `driver-1752965015316@stackd.co.uk`

---

## Quick Fix Script

If you want to reset the password, I can create a script to:
1. Update the driver's password hash
2. Set it to a known value like `driver123`

Would you like me to create this script?

