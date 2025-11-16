# Troubleshooting Guide

Common issues and their solutions for the Student Attendance Tracker application.

## 🔐 Authentication Issues

### Problem: Cannot login with default credentials

**Symptoms:**
- Login form shows "Login failed" error
- "Invalid credentials" message
- Infinite loading on login

**Solutions:**

1. **Verify admin user exists**
   ```sql
   -- In Supabase SQL Editor
   SELECT email, confirmed_at FROM auth.users;
   ```

2. **Check if email is confirmed**
   - User must have `confirmed_at` timestamp
   - If null, recreate user with "Auto Confirm" checked

3. **Verify credentials**
   - Email: `admin@school.com` (exact case)
   - Password: `admin123` (exact case)

4. **Check Supabase connection**
   - Verify project URL in `/utils/supabase/info.tsx`
   - Check anon key is correct
   - Ensure Supabase project is active

### Problem: "Session expired" error

**Solution:**
```typescript
// Clear browser storage and re-login
localStorage.clear();
sessionStorage.clear();
// Then refresh page and login again
```

### Problem: "Unauthorized" errors after login

**Cause:** RLS policies not properly configured

**Solution:**
```sql
-- Verify RLS policies exist
SELECT * FROM pg_policies 
WHERE tablename IN ('students', 'attendance');

-- If missing, re-run the RLS policy section from DATABASE_SETUP.md
```

## 📊 Database Issues

### Problem: "Cannot read from students table"

**Error message:** `permission denied for table students`

**Solution:**

1. **Enable RLS**
   ```sql
   ALTER TABLE students ENABLE ROW LEVEL SECURITY;
   ```

2. **Add read policy**
   ```sql
   CREATE POLICY "Allow authenticated read students" ON students
     FOR SELECT TO authenticated USING (true);
   ```

3. **Verify user is authenticated**
   - Check if user is logged in
   - Verify JWT token is valid

### Problem: "Foreign key violation" when deleting student

**Error message:** `violates foreign key constraint`

**Solution:**

This shouldn't happen due to CASCADE delete, but if it does:

```sql
-- Check for orphaned attendance records
SELECT a.* FROM attendance a
LEFT JOIN students s ON a."studentId" = s.id
WHERE s.id IS NULL;

-- Delete orphaned records
DELETE FROM attendance 
WHERE "studentId" NOT IN (SELECT id FROM students);
```

### Problem: Duplicate attendance records

**Error message:** `duplicate key value violates unique constraint`

**Solution:**

1. **Delete duplicate record first**
   ```sql
   DELETE FROM attendance 
   WHERE "studentId" = 'STUDENT_ID' 
   AND date = '2024-01-15';
   ```

2. **Then insert new record**

Or use upsert:
```sql
INSERT INTO attendance ("studentId", date, status, standard, "createdAt")
VALUES ('...', '2024-01-15', 'present', 8, NOW())
ON CONFLICT ("studentId", date) 
DO UPDATE SET status = EXCLUDED.status;
```

### Problem: Slow query performance

**Symptoms:**
- Pages take long to load
- Attendance marking is slow
- Reports timeout

**Solutions:**

1. **Verify indexes exist**
   ```sql
   SELECT tablename, indexname FROM pg_indexes 
   WHERE schemaname = 'public' 
   AND tablename IN ('students', 'attendance');
   ```

2. **Add missing indexes**
   ```sql
   CREATE INDEX IF NOT EXISTS idx_students_standard ON students(standard);
   CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
   ```

3. **Optimize queries**
   - Use specific column selection instead of `SELECT *`
   - Add pagination
   - Filter by date range

## 📁 Storage Issues

### Problem: Photo upload fails

**Error message:** `Failed to upload image` or `Storage error`

**Solutions:**

1. **Check bucket exists**
   - Go to Supabase → Storage
   - Verify `attendance-tracker` bucket exists
   - Check it's marked as **Public**

2. **Verify file size**
   - Maximum: 5MB
   - Compress large images before upload

3. **Check file type**
   - Allowed: JPG, JPEG, PNG, GIF
   - Not allowed: WEBP, SVG, BMP, etc.

4. **Check storage policies**
   ```sql
   -- Allow authenticated uploads
   CREATE POLICY "Allow authenticated uploads" ON storage.objects
     FOR INSERT TO authenticated
     WITH CHECK (bucket_id = 'attendance-tracker');
   
   -- Allow public read
   CREATE POLICY "Allow public read" ON storage.objects
     FOR SELECT TO public
     USING (bucket_id = 'attendance-tracker');
   ```

### Problem: Images not displaying

**Symptoms:**
- Broken image icons
- 404 errors in console
- Photos uploaded but don't show

**Solutions:**

1. **Check bucket is public**
   - Supabase → Storage → attendance-tracker
   - Toggle "Public" to ON

2. **Verify URL format**
   ```typescript
   // Correct format:
   https://PROJECT_ID.supabase.co/storage/v1/object/public/attendance-tracker/filename.jpg
   ```

3. **Check CORS settings**
   - Supabase → Storage → Configuration
   - Add your domain to allowed origins

### Problem: Storage quota exceeded

**Solution:**

1. **Check current usage**
   - Supabase → Storage → Usage

2. **Clean up old images**
   ```sql
   -- Find students without photos
   SELECT id, "firstName", "fatherName", surname 
   FROM students 
   WHERE "studentPhoto" IS NULL;
   
   -- List unused images
   -- (Compare storage files with studentPhoto URLs)
   ```

3. **Upgrade Supabase plan**
   - If consistently hitting limits

## 🎨 UI/Frontend Issues

### Problem: Styles not loading

**Symptoms:**
- Plain unstyled page
- Missing colors/layouts
- Buttons look wrong

**Solutions:**

1. **Check Tailwind is working**
   ```bash
   npm run dev
   # Look for Tailwind processing in terminal
   ```

2. **Rebuild the app**
   ```bash
   rm -rf node_modules dist
   npm install
   npm run build
   ```

3. **Clear browser cache**
   - Hard refresh: Ctrl+Shift+R (Windows/Linux)
   - Hard refresh: Cmd+Shift+R (Mac)

### Problem: Components not rendering

**Error in console:** `Cannot find module '@/components/ui/...'`

**Solution:**

1. **Check shadcn components exist**
   ```bash
   ls components/ui/
   ```

2. **Reinstall if missing**
   ```bash
   # Components are already included
   # If deleted, restore from backup or repository
   ```

### Problem: Mobile menu not working

**Symptoms:**
- Hamburger icon doesn't respond
- Menu doesn't open on mobile

**Solution:**

1. **Check console for errors**
   - Open browser dev tools (F12)
   - Look for JavaScript errors

2. **Clear state**
   ```typescript
   // In App.tsx, check mobileMenuOpen state
   // Try resetting by refreshing page
   ```

## 📱 Mobile Issues

### Problem: Layout broken on mobile

**Solutions:**

1. **Check viewport meta tag**
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   ```

2. **Test responsive classes**
   - Use Chrome DevTools device emulation
   - Test on actual devices

3. **Check Tailwind breakpoints**
   ```tsx
   // Correct:
   className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
   
   // Wrong:
   className="grid grid-cols-4"
   ```

### Problem: Touch interactions not working

**Solution:**

- Use `onClick` instead of `onMouseDown`
- Ensure touch targets are at least 44x44px
- Test on actual touch devices

## 📊 Reporting Issues

### Problem: Reports show no data

**Symptoms:**
- Empty tables
- "No data found" message
- Zero attendance records

**Solutions:**

1. **Check date range**
   - Start date must be before end date
   - Date range must include days with attendance

2. **Verify attendance exists**
   ```sql
   SELECT date, COUNT(*) as records 
   FROM attendance 
   GROUP BY date 
   ORDER BY date DESC 
   LIMIT 10;
   ```

3. **Check class filter**
   - Try "All Classes" first
   - Verify students exist in selected class

### Problem: CSV export fails

**Symptoms:**
- Nothing downloads
- Empty CSV file
- Browser error

**Solutions:**

1. **Check browser permissions**
   - Allow downloads from the site
   - Disable popup blockers

2. **Try different browser**
   - Chrome, Firefox, Safari, Edge

3. **Check console errors**
   ```javascript
   // Look for errors in browser console
   // May indicate data formatting issues
   ```

### Problem: Wrong percentage calculations

**Solution:**

```sql
-- Verify calculation logic
SELECT 
  s."firstName",
  COUNT(a.id) as total,
  SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present,
  ROUND(
    (SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END)::NUMERIC / 
     COUNT(a.id)::NUMERIC * 100), 
    2
  ) as percentage
FROM students s
LEFT JOIN attendance a ON s.id = a."studentId"
WHERE a.date BETWEEN '2024-01-01' AND '2024-01-31'
GROUP BY s.id, s."firstName";
```

## 🔄 Data Issues

### Problem: Student data not saving

**Symptoms:**
- Form submits but data doesn't appear
- Success message but no new student

**Solutions:**

1. **Check console errors**
   - Open browser dev tools
   - Look for network errors

2. **Verify required fields**
   - All fields marked with * are required
   - Mobile number must be valid (10 digits, starts with 6-9)

3. **Check validation**
   ```typescript
   // Mobile validation regex:
   /^[6-9]\d{9}$/
   ```

### Problem: Attendance not saving

**Solutions:**

1. **Check if students are marked**
   - At least one student must be marked
   - Status must be either "present" or "absent"

2. **Verify network request**
   - Check browser Network tab
   - Look for 200 OK response

3. **Check database constraints**
   ```sql
   -- Verify no conflicts
   SELECT * FROM attendance 
   WHERE date = CURRENT_DATE 
   AND standard = 8;
   ```

### Problem: Data disappears after refresh

**Cause:** Not using Supabase properly or session issues

**Solution:**

1. **Check if data is in database**
   ```sql
   SELECT * FROM students ORDER BY "createdAt" DESC LIMIT 10;
   SELECT * FROM attendance ORDER BY "createdAt" DESC LIMIT 10;
   ```

2. **Verify authentication persists**
   - Should auto-login if session is valid
   - Check browser localStorage for auth token

## 🌐 Network Issues

### Problem: "Network error" messages

**Solutions:**

1. **Check internet connection**
   - Verify you're online
   - Test other websites

2. **Check Supabase status**
   - Visit [status.supabase.com](https://status.supabase.com)
   - Check if services are operational

3. **Verify project is active**
   - Log into Supabase Dashboard
   - Check if project is paused (free tier auto-pauses after inactivity)

4. **Check CORS settings**
   - Ensure your domain is allowed
   - Check browser console for CORS errors

### Problem: Slow loading times

**Solutions:**

1. **Check database indexes**
   - Verify indexes exist (see DATABASE_SETUP.md)

2. **Optimize images**
   - Compress photos before upload
   - Use appropriate image sizes

3. **Check network speed**
   - Test on different networks
   - Use browser Network tab to identify slow requests

4. **Enable caching**
   - Add service worker (PWA)
   - Use CDN for static assets

## 🐛 Common Error Messages

### "RLS policy violation"

**Fix:**
```sql
-- Re-run RLS policies from DATABASE_SETUP.md
-- Make sure user is authenticated
```

### "JWT expired"

**Fix:**
- Logout and login again
- Supabase will auto-refresh tokens

### "Invalid input syntax for type uuid"

**Fix:**
- Ensure you're passing valid UUID strings
- Check if student ID exists before referencing

### "Cannot read property of undefined"

**Fix:**
- Check for null/undefined values
- Add optional chaining: `student?.firstName`
- Add loading states

### "Failed to fetch"

**Causes:**
- Network issue
- Supabase project paused
- Wrong API endpoint

**Fix:**
- Check network connection
- Verify Supabase project is active
- Check API URLs in code

## 🔧 Development Issues

### Problem: npm install fails

**Solutions:**

1. **Clear npm cache**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Use correct Node version**
   ```bash
   node --version  # Should be v16 or higher
   ```

3. **Try yarn instead**
   ```bash
   yarn install
   ```

### Problem: npm run dev fails

**Solutions:**

1. **Check port 3000 is free**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **Try different port**
   ```bash
   npm run dev -- --port 3001
   ```

3. **Check for syntax errors**
   - Look at error message
   - Fix TypeScript/JavaScript errors

## 📝 Validation Issues

### Problem: Mobile number validation failing

**Requirements:**
- Exactly 10 digits
- Must start with 6, 7, 8, or 9
- Only numbers (no spaces, dashes, or +91)

**Valid examples:**
- 9876543210 ✅
- 8123456789 ✅
- 7654321098 ✅
- 6543210987 ✅

**Invalid examples:**
- 1234567890 ❌ (starts with 1)
- 987654321 ❌ (only 9 digits)
- 98765 43210 ❌ (has space)
- +91-9876543210 ❌ (has country code and dash)

### Problem: Date validation issues

**Solution:**
- Date of birth cannot be in the future
- Attendance date cannot be in the future
- Use YYYY-MM-DD format

## 🆘 Getting Help

### Before asking for help:

1. **Check console errors**
   - Press F12 in browser
   - Look at Console tab
   - Copy any error messages

2. **Check Supabase logs**
   - Supabase Dashboard → Logs
   - Look for errors or warnings

3. **Try in incognito mode**
   - Rules out cache/extension issues

4. **Clear application data**
   ```javascript
   // In browser console:
   localStorage.clear();
   sessionStorage.clear();
   // Then refresh page
   ```

### Information to provide:

- Browser and version
- Operating system
- Error message (exact text)
- Console errors (screenshot)
- Steps to reproduce
- What you've already tried

### Resources:

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **React Docs**: [react.dev](https://react.dev)
- **Tailwind Docs**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Community**: Stack Overflow, Reddit r/Supabase

## 🔍 Debugging Tips

### Enable verbose logging:

```typescript
// Add this to your code for debugging:
console.log('User:', user);
console.log('Students:', students);
console.log('Attendance:', attendance);

// For Supabase queries:
const { data, error } = await supabase.from('students').select();
console.log('Data:', data);
console.log('Error:', error);
```

### Use React DevTools:

1. Install React Developer Tools browser extension
2. Inspect component state
3. Check props and hooks

### Monitor Network Requests:

1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Check request/response data

## ✅ Still Having Issues?

If none of these solutions work:

1. **Restore from backup**
   - Redeploy from Git
   - Restore database from backup
   - Re-run setup scripts

2. **Start fresh**
   - Create new Supabase project
   - Run setup scripts again
   - Migrate data if needed

3. **Check documentation**
   - Re-read README.md
   - Review DATABASE_SETUP.md
   - Check QUICKSTART.md

---

**Most issues can be solved by carefully following the setup instructions in README.md and DATABASE_SETUP.md**

Good luck! 🍀
