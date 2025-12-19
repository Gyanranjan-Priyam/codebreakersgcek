# QR Code Attendance System

This feature enables administrators to generate time-limited QR codes that students can scan to mark their attendance automatically.

## Features

### Admin Dashboard
- **Session Creation**: Create new attendance sessions with title and date
- **QR Code Generation**: Generate unique QR codes for attendance sessions
- **5-Minute Expiry**: Each QR code automatically expires after 5 minutes
- **Real-time Timer**: Visual countdown showing time remaining
- **Session Management**: Select from existing attendance sessions via dropdown or table
- **Active QR Tracking**: View all active QR codes with scan counts
- **Manual Deactivation**: Admins can manually deactivate QR codes
- **Large Display**: QR codes are displayed in a large format suitable for projection
- **Sessions Table**: View all sessions with attendance and QR code counts

### Student Side
- **Camera-Based QR Scanning**: Real-time camera scanning with automatic detection
- **Live Camera Preview**: See what the camera sees while scanning
- **Instant Verification**: Immediate feedback on attendance status
- **Points System**: Automatic point allocation for attendance
- **Duplicate Prevention**: System prevents marking attendance twice
- **Attendance History**: View all past attendance records
- **Statistics Dashboard**: See total sessions, attendance %, and points earned
- **Mobile-Friendly**: Works on both desktop and mobile devices

## Database Schema

### AttendanceQR Model
```prisma
model AttendanceQR {
  id            String   @id @default(cuid())
  sessionId     String
  qrToken       String   @unique
  expiresAt     DateTime
  createdAt     DateTime @default(now())
  createdBy     String
  isActive      Boolean  @default(true)
  scanCount     Int      @default(0)
  
  session AttendanceSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
}
```

### Updated Attendance Model
Added fields:
- `method`: "manual" or "qr-scan" to track how attendance was marked
- `markedBy`: Can be admin ID or "qr-scan" for QR-based attendance

## API Endpoints

### POST /api/admin/attendance/generate-qr
Generate a new QR code for an attendance session.

**Request Body:**
```json
{
  "sessionId": "session-id-here"
}
```

**Response:**
```json
{
  "success": true,
  "qrCode": "data:image/png;base64,...",
  "qrToken": "unique-token",
  "expiresAt": "2025-12-19T10:35:00.000Z",
  "sessionId": "session-id",
  "sessionTitle": "Session Title"
}
```

### POST /api/admin/attendance/verify-qr
Verify a QR code and mark attendance.

**Request Body:**
```json
{
  "token": "qr-token",
  "sessionId": "session-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance marked successfully!",
  "attendance": {...},
  "sessionTitle": "Session Title",
  "points": 10
}
```

### GET /api/admin/attendance/qr-status
Get active QR codes for a session.

**Query Parameters:**
- `sessionId`: The attendance session ID

### DELETE /api/admin/attendance/qr-status
Deactivate a QR code.

**Request Body:**
```json
{
  "qrToken": "token-to-deactivate"
}
```

### GET /api/admin/attendance/sessions
Get all attendance sessions with counts.

**Response:**
```json
{
  "success": true,
  "sessions": [
   Click "Create Session" to create a new attendance session
3. Enter session number, title, and select a date
4. Select the created session from the dropdown or table
5. Click "Generate New QR Code"
6. Display the QR code on a projector or large screen
7. Monitor the timer and scan count
8. The QR code will automatically expire after 5 minutes
9. You can manually deactivate it anytime
10. View all sessions in the table with attendance statistics
      "_count": {
        "attendances": 25,
        "qrCodes": 3
      }
    }
  ]
}
```

### POST /api/admin/attendance/sessions
Create a new attendance session.

**Request Body:**
```json
{
  "sessionNumber": 1,
  "title": "Workshop Session 1",
  "date": "2025-12-19T00:00:00.000Z",
  "day": "Thursday"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance session created successfully",
  "session": {
    "id": "session-id",
    "sessionNumber": 1,
    "title": "Workshop Session 1",
    "date": "2025-12-19T00:00:00.000Z",
    "day": "Thursday",
    "createdBy": "admin-user-id"
  }
}
```

## How to Use

### For Administrators

1. Navigate to `/admin/attendance`
2. Select an attendance session from the dropdown
3. Click "Generate New QR Code"
4. Display the QR code on a projector or large screen
5. Monitor the timer and scan count
6. The QR code will automatically expire after 5 minutes
7. You can manually deactivate it anytime

### For Students

1. Navigate to the attendance scanning page at `/dashboard/attendance`
2. Click "Start Camera" to activate your device camera
3. Allow camera permissions when prompted
4. Point your camera at the QR code displayed by instructor
5. The app will automatically scan and mark attendance
6. Receive instant confirmation and points
7. View your attendance history and statistics below

## Migration Steps

Before using this feature, run the database migration:

```bash
npx prisma migrate dev --name add_qr_attendance
```

Or in production:

```bash
npx prisma migrate deploy
```

## Security Features

1. **Token-based Authentication**: Unique cryptographic tokens for each QR code
2. **Time-limited Validity**: 5-minute expiration prevents reuse
3. **Session Validation**: QR codes are tied to specific attendance sessions
4. **Duplicate Prevention**: Users cannot mark attendance twice for the same session
5. **Manual Override**: Admins can deactivate QR codes at any time
6. **Scan Tracking**: Monitor how many times a QR code has been scanned

## Future Enhancements

1. **Mobile Camera Integration**: Integrate with device camera for real-time QR scanning
2. **Geolocation**: Add location verification to ensure students are physically present
3. **Bulk Operations**: Generate QR codes for multiple sessions at once
4. **Analytics Dashboard**: View attendance patterns and trends
5. **Export Reports**: Download attendance reports with QR scan details
6. **Custom Expiry Times**: Allow admins to set custom expiration times
7. **SMS/Email Notifications**: Notify students when QR codes are available

## Components
- `app/admin/attendance/_components/create-session-dialog.tsx`: Dialog for creating new sessions
- `app/admin/attendance/_components/sessions-table.tsx`: Table displaying all sessions

### Admin Components
- `app/admin/attendance/page.tsx`: Main admin attendance page with QR generation

### Student Components
- `app/(public)/dashboard/attendance/page.tsx`: Student QR scanner with camera
- `app/(public)/dashboard/attendance/_components/attendance-history.tsx`: Attendance history and stats
- `app/(public)/dashboard/attendance/actions.ts`: Server actions for fetching attendance data

## Dependencies

The following packages are installed:
- `qrcode`: QR code generation library (admin side)
- `@types/qrcode`: TypeScript types for qrcode
- `html5-qrcode`: Camera-based QR code scanner (student side)

## Browser Compatibility

### Admin Dashboard
- Works on all modern browsers
- No special permissions required

### Student Scanner
- Requires camera access
- Supported browsers:
  - Chrome/Edge (Desktop & Mobile)
  - Firefox (Desktop & Mobile)
  - Safari (Desktop & Mobile)
- Camera permissions must be granted
- HTTPS required (or localhost for development)

## Notes

- QR codes are generated as base64-encoded PNG images
- Each QR code contains a JSON payload with token, sessionId, and type
- The system automatically deactivates old QR codes when generating new ones
- Scan counts help admins monitor usage and detect potential issues
