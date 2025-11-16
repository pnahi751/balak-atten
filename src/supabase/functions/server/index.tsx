import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js";

const app = new Hono();

// Initialize Supabase admin client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

// Storage bucket name
const BUCKET_NAME = "make-3578af81-student-photos";

// Initialize storage bucket on startup
async function initializeStorage() {
  try {
    const { data: buckets } =
      await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(
      (bucket) => bucket.name === BUCKET_NAME,
    );

    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(
        BUCKET_NAME,
        {
          public: false,
          fileSizeLimit: 5242880, // 5MB
        },
      );

      if (error) {
        console.error("Error creating storage bucket:", error);
      } else {
        console.log("Storage bucket created successfully");
      }
    }
  } catch (error) {
    console.error("Error initializing storage:", error);
  }
}

// Initialize on startup
initializeStorage();

// Enable logger
app.use("*", logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-3578af81/health", (c) => {
  return c.json({ status: "ok" });
});

// Initialize default admin user
app.post("/make-server-3578af81/init-admin", async (c) => {
  try {
    const defaultEmail = "admin@school.com";
    const defaultPassword = "admin123";

    // Check if admin user already exists
    const { data: existingUsers } =
      await supabase.auth.admin.listUsers();
    const adminExists = existingUsers?.users?.some(
      (user) => user.email === defaultEmail,
    );

    if (adminExists) {
      return c.json({
        success: true,
        message: "Admin user already exists",
        alreadyExists: true,
      });
    }

    // Create admin user
    const { data, error } =
      await supabase.auth.admin.createUser({
        email: defaultEmail,
        password: defaultPassword,
        email_confirm: true, // Automatically confirm email since email server hasn't been configured
        user_metadata: {
          name: "Administrator",
          role: "admin",
        },
      });

    if (error) {
      console.error("Error creating admin user:", error);
      return c.json(
        {
          success: false,
          error: `Failed to create admin user: ${error.message}`,
        },
        500,
      );
    }

    return c.json({
      success: true,
      message: "Admin user created successfully",
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
    });
  } catch (error) {
    console.error("Error in init-admin:", error);
    return c.json(
      {
        success: false,
        error: `Internal server error: ${error.message}`,
      },
      500,
    );
  }
});

// Signup endpoint for creating new admin users
app.post("/make-server-3578af81/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return c.json(
        {
          success: false,
          error: "Email and password are required",
        },
        400,
      );
    }

    const { data, error } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Automatically confirm email since email server hasn't been configured
        user_metadata: {
          name: name || "Admin User",
          role: "admin",
        },
      });

    if (error) {
      console.error("Error during signup:", error);
      return c.json(
        {
          success: false,
          error: `Signup failed: ${error.message}`,
        },
        400,
      );
    }

    return c.json({
      success: true,
      message: "User created successfully",
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
    });
  } catch (error) {
    console.error("Error in signup endpoint:", error);
    return c.json(
      {
        success: false,
        error: `Internal server error: ${error.message}`,
      },
      500,
    );
  }
});

// ============ STUDENT MANAGEMENT ENDPOINTS ============

// Get all classes/standards
app.get("/make-server-3578af81/classes", async (c) => {
  try {
    const classes = (await kv.get("classes")) || [
      { id: 1, name: "Class 1", standard: 1 },
      { id: 2, name: "Class 2", standard: 2 },
      { id: 3, name: "Class 3", standard: 3 },
      { id: 4, name: "Class 4", standard: 4 },
      { id: 5, name: "Class 5", standard: 5 },
      { id: 6, name: "Class 6", standard: 6 },
      { id: 7, name: "Class 7", standard: 7 },
      { id: 8, name: "Class 8", standard: 8 },
      { id: 9, name: "Class 9", standard: 9 },
      { id: 10, name: "Class 10", standard: 10 },
      { id: 11, name: "Class 11", standard: 11 },
      { id: 12, name: "Class 12", standard: 12 },
    ];

    return c.json({ success: true, data: classes });
  } catch (error) {
    console.error("Error fetching classes:", error);
    return c.json(
      {
        success: false,
        error: `Failed to fetch classes: ${error.message}`,
      },
      500,
    );
  }
});

// Update classes configuration
app.post("/make-server-3578af81/classes", async (c) => {
  try {
    const body = await c.req.json();
    const { classes } = body;

    if (!classes || !Array.isArray(classes)) {
      return c.json(
        {
          success: false,
          error: "Classes array is required",
        },
        400,
      );
    }

    await kv.set("classes", classes);

    return c.json({
      success: true,
      data: classes,
      message: "Classes updated successfully",
    });
  } catch (error) {
    console.error("Error updating classes:", error);
    return c.json(
      {
        success: false,
        error: `Failed to update classes: ${error.message}`,
      },
      500,
    );
  }
});

// Get all unique schools
app.get("/make-server-3578af81/schools", async (c) => {
  try {
    const students = await kv.getByPrefix("student:");
    const schools = [
      ...new Set(
        students.map((s: any) => s.school).filter(Boolean),
      ),
    ];

    return c.json({ success: true, data: schools.sort() });
  } catch (error) {
    console.error("Error fetching schools:", error);
    return c.json(
      {
        success: false,
        error: `Failed to fetch schools: ${error.message}`,
      },
      500,
    );
  }
});

// Get all students
app.get("/make-server-3578af81/students", async (c) => {
  try {
    const students = await kv.getByPrefix("student:");
    return c.json({ success: true, data: students || [] });
  } catch (error) {
    console.error("Error fetching students:", error);
    return c.json(
      {
        success: false,
        error: `Failed to fetch students: ${error.message}`,
      },
      500,
    );
  }
});

// Get a single student by ID
app.get("/make-server-3578af81/students/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const student = await kv.get(`student:${id}`);

    if (!student) {
      return c.json(
        {
          success: false,
          error: "Student not found",
        },
        404,
      );
    }

    return c.json({ success: true, data: student });
  } catch (error) {
    console.error("Error fetching student:", error);
    return c.json(
      {
        success: false,
        error: `Failed to fetch student: ${error.message}`,
      },
      500,
    );
  }
});

// Create a new student
app.post("/make-server-3578af81/students", async (c) => {
  try {
    const body = await c.req.json();
    const {
      firstName,
      fatherName,
      surname,
      dateOfBirth,
      mobileNumber,
      standard,
      address,
      studentPhoto,
    } = body;

    // Validate required fields
    if (
      !firstName ||
      !surname ||
      !dateOfBirth ||
      !mobileNumber ||
      !standard
    ) {
      return c.json(
        {
          success: false,
          error: "Missing required fields",
        },
        400,
      );
    }

    // Generate unique ID
    const id = crypto.randomUUID();

    const student = {
      id,
      firstName,
      fatherName: fatherName || "",
      surname,
      dateOfBirth,
      mobileNumber,
      standard: parseInt(standard),
      address: address || "",
      studentPhoto: studentPhoto || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`student:${id}`, student);

    return c.json({
      success: true,
      data: student,
      message: "Student created successfully",
    });
  } catch (error) {
    console.error("Error creating student:", error);
    return c.json(
      {
        success: false,
        error: `Failed to create student: ${error.message}`,
      },
      500,
    );
  }
});

// Update a student
app.put("/make-server-3578af81/students/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    const existingStudent = await kv.get(`student:${id}`);

    if (!existingStudent) {
      return c.json(
        {
          success: false,
          error: "Student not found",
        },
        404,
      );
    }

    const updatedStudent = {
      ...existingStudent,
      ...body,
      id, // Ensure ID doesn't change
      standard: body.standard
        ? parseInt(body.standard)
        : existingStudent.standard,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`student:${id}`, updatedStudent);

    return c.json({
      success: true,
      data: updatedStudent,
      message: "Student updated successfully",
    });
  } catch (error) {
    console.error("Error updating student:", error);
    return c.json(
      {
        success: false,
        error: `Failed to update student: ${error.message}`,
      },
      500,
    );
  }
});

// Delete a student
app.delete("/make-server-3578af81/students/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const existingStudent = await kv.get(`student:${id}`);

    if (!existingStudent) {
      return c.json(
        {
          success: false,
          error: "Student not found",
        },
        404,
      );
    }

    // Delete student
    await kv.del(`student:${id}`);

    // Delete all attendance records for this student
    const attendanceRecords =
      await kv.getByPrefix("attendance:");
    const studentAttendance = attendanceRecords.filter(
      (record: any) => record.studentId === id,
    );

    for (const record of studentAttendance) {
      await kv.del(
        `attendance:${record.date}:${record.studentId}`,
      );
    }

    return c.json({
      success: true,
      message:
        "Student and related attendance records deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    return c.json(
      {
        success: false,
        error: `Failed to delete student: ${error.message}`,
      },
      500,
    );
  }
});

// ============ ATTENDANCE MANAGEMENT ENDPOINTS ============

// Get attendance for a specific date and optional standard filter
app.get("/make-server-3578af81/attendance", async (c) => {
  try {
    const date = c.req.query("date");
    const standard = c.req.query("standard");

    if (!date) {
      return c.json(
        {
          success: false,
          error: "Date parameter is required",
        },
        400,
      );
    }

    // Get all attendance for the date
    const allAttendance = await kv.getByPrefix(
      `attendance:${date}:`,
    );

    // Get all students
    const allStudents = await kv.getByPrefix("student:");

    // Filter students by standard if provided
    let students = allStudents;
    if (standard) {
      students = allStudents.filter(
        (s: any) => s.standard === parseInt(standard),
      );
    }

    // Combine student data with attendance data
    const result = students.map((student: any) => {
      const attendance = allAttendance.find(
        (a: any) => a.studentId === student.id,
      );
      return {
        ...student,
        status: attendance?.status || null,
        markedAt: attendance?.markedAt || null,
      };
    });

    return c.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return c.json(
      {
        success: false,
        error: `Failed to fetch attendance: ${error.message}`,
      },
      500,
    );
  }
});

// Mark attendance for a student
app.post("/make-server-3578af81/attendance", async (c) => {
  try {
    const body = await c.req.json();
    const { studentId, date, status } = body;

    if (!studentId || !date || !status) {
      return c.json(
        {
          success: false,
          error:
            "Missing required fields: studentId, date, status",
        },
        400,
      );
    }

    if (!["present", "absent"].includes(status.toLowerCase())) {
      return c.json(
        {
          success: false,
          error: 'Status must be either "present" or "absent"',
        },
        400,
      );
    }

    const attendance = {
      studentId,
      date,
      status: status.toLowerCase(),
      markedAt: new Date().toISOString(),
    };

    await kv.set(`attendance:${date}:${studentId}`, attendance);

    return c.json({
      success: true,
      data: attendance,
      message: "Attendance marked successfully",
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    return c.json(
      {
        success: false,
        error: `Failed to mark attendance: ${error.message}`,
      },
      500,
    );
  }
});

// Bulk mark attendance
app.post("/make-server-3578af81/attendance/bulk", async (c) => {
  try {
    const body = await c.req.json();
    const { records } = body;

    if (!records || !Array.isArray(records)) {
      return c.json(
        {
          success: false,
          error: "Records array is required",
        },
        400,
      );
    }

    const results = [];

    for (const record of records) {
      const { studentId, date, status } = record;

      if (studentId && date && status) {
        const attendance = {
          studentId,
          date,
          status: status.toLowerCase(),
          markedAt: new Date().toISOString(),
        };

        await kv.set(
          `attendance:${date}:${studentId}`,
          attendance,
        );
        results.push(attendance);
      }
    }

    return c.json({
      success: true,
      data: results,
      message: `${results.length} attendance records marked successfully`,
    });
  } catch (error) {
    console.error("Error bulk marking attendance:", error);
    return c.json(
      {
        success: false,
        error: `Failed to bulk mark attendance: ${error.message}`,
      },
      500,
    );
  }
});

// Get attendance reports
app.get(
  "/make-server-3578af81/reports/attendance",
  async (c) => {
    try {
      const startDate = c.req.query("startDate");
      const endDate = c.req.query("endDate");
      const standard = c.req.query("standard");
      const school = c.req.query("school");

      if (!startDate || !endDate) {
        return c.json(
          {
            success: false,
            error:
              "startDate and endDate parameters are required",
          },
          400,
        );
      }

      // Get all attendance records
      const allAttendance = await kv.getByPrefix("attendance:");

      // Get all students
      let students = await kv.getByPrefix("student:");

      // Filter students by standard if provided
      if (standard) {
        students = students.filter(
          (s: any) => s.standard === parseInt(standard),
        );
      }

      // Filter students by school if provided
      if (school && school !== "all") {
        students = students.filter(
          (s: any) => s.school === school,
        );
      }

      // Filter attendance by date range
      const filteredAttendance = allAttendance.filter(
        (record: any) => {
          return (
            record.date >= startDate && record.date <= endDate
          );
        },
      );

      // Build report data
      const report = students.map((student: any) => {
        const studentAttendance = filteredAttendance.filter(
          (a: any) => a.studentId === student.id,
        );
        const presentCount = studentAttendance.filter(
          (a: any) => a.status === "present",
        ).length;
        const absentCount = studentAttendance.filter(
          (a: any) => a.status === "absent",
        ).length;
        const totalDays = studentAttendance.length;
        const attendancePercentage =
          totalDays > 0
            ? ((presentCount / totalDays) * 100).toFixed(2)
            : "0.00";

        return {
          studentId: student.id,
          firstName: student.firstName,
          fatherName: student.fatherName,
          surname: student.surname,
          standard: student.standard,
          mobileNumber: student.mobileNumber,
          presentDays: presentCount,
          absentDays: absentCount,
          totalDays,
          attendancePercentage: parseFloat(
            attendancePercentage,
          ),
        };
      });

      return c.json({ success: true, data: report });
    } catch (error) {
      console.error(
        "Error generating attendance report:",
        error,
      );
      return c.json(
        {
          success: false,
          error: `Failed to generate report: ${error.message}`,
        },
        500,
      );
    }
  },
);

// Upload student photo
app.post("/make-server-3578af81/upload-photo", async (c) => {
  try {
    const body = await c.req.json();
    const { fileName, fileData, studentId } = body;

    if (!fileName || !fileData) {
      return c.json(
        {
          success: false,
          error: "fileName and fileData are required",
        },
        400,
      );
    }

    // Decode base64 data
    const base64Data = fileData.split(",")[1] || fileData;
    const buffer = Uint8Array.from(atob(base64Data), (c) =>
      c.charCodeAt(0),
    );

    // Generate unique file name
    const fileExt = fileName.split(".").pop();
    const uniqueFileName = `${studentId || crypto.randomUUID()}-${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(uniqueFileName, buffer, {
        contentType: `image/${fileExt}`,
        upsert: true,
      });

    if (error) {
      console.error("Storage upload error:", error);
      return c.json(
        {
          success: false,
          error: `Failed to upload photo: ${error.message}`,
        },
        500,
      );
    }

    // Get signed URL (valid for 1 year)
    const { data: signedUrlData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(uniqueFileName, 31536000);

    return c.json({
      success: true,
      data: {
        fileName: uniqueFileName,
        url: signedUrlData?.signedUrl || null,
      },
      message: "Photo uploaded successfully",
    });
  } catch (error) {
    console.error("Error uploading photo:", error);
    return c.json(
      {
        success: false,
        error: `Failed to upload photo: ${error.message}`,
      },
      500,
    );
  }
});

// Get dashboard statistics
app.get("/make-server-3578af81/dashboard/stats", async (c) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Get all students
    const allStudents = await kv.getByPrefix("student:");
    const totalStudents = allStudents.length;

    // Get today's attendance
    const todayAttendance = await kv.getByPrefix(
      `attendance:${today}:`,
    );
    const presentToday = todayAttendance.filter(
      (a: any) => a.status === "present",
    ).length;
    const absentToday = todayAttendance.filter(
      (a: any) => a.status === "absent",
    ).length;

    // Count students by standard
    const studentsByClass = allStudents.reduce(
      (acc: any, student: any) => {
        acc[student.standard] =
          (acc[student.standard] || 0) + 1;
        return acc;
      },
      {},
    );

    return c.json({
      success: true,
      data: {
        totalStudents,
        presentToday,
        absentToday,
        studentsByClass,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return c.json(
      {
        success: false,
        error: `Failed to fetch dashboard stats: ${error.message}`,
      },
      500,
    );
  }
});

Deno.serve(app.fetch);