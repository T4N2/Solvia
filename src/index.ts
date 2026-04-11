import { Elysia } from "elysia";
import { handleContactSubmission } from "./api/contact";
import { uploadRoutes } from "./api/upload";
import { verifyAdminCredentials, isLockedOut, recordFailedAttempt, clearFailedAttempts } from "./auth/admin-config";
import { generateToken, requireAuth } from "./auth/middleware";
import { readFile, access, writeFile } from "fs/promises";
import { createReadStream } from "fs";
import { staticPlugin } from "@elysiajs/static";
import path from "path";

const app = new Elysia()
  .use(
    staticPlugin({
      assets: path.join(process.cwd(), "public"),
      prefix: "/",
    })
  )
  .use(
    staticPlugin({
      assets: path.join(process.cwd(), "data"),
      prefix: "/data",
    })
  )
  // Upload routes
  .use(uploadRoutes)

  // API routes first
  .get("/api/portfolio", async ({ query, set }) => {
    try {
      const portfolioPath = path.join(process.cwd(), "data/portfolio.json");

      try {
        await access(portfolioPath);
      } catch {
        set.status = 404;
        set.headers["Cache-Control"] = "no-cache";
        return {
          success: false,
          message: "Portfolio data not found",
        };
      }

      const portfolioData = JSON.parse(await readFile(portfolioPath, "utf-8"));

      // Apply filtering if category is provided
      let filteredData = portfolioData;
      if (query.category && typeof query.category === "string") {
        filteredData = portfolioData.filter((item: any) => item.category === query.category);
      }

      set.headers["Cache-Control"] = "no-store";
      set.headers["ETag"] = `"portfolio-${Date.now()}"`;

      return {
        success: true,
        data: filteredData,
      };
    } catch (error) {
      console.error("Portfolio API error:", error);
      set.status = 500;
      set.headers["Cache-Control"] = "no-cache";
      return {
        success: false,
        message: "Failed to retrieve portfolio data",
      };
    }
  })
  .get("/api/services", async ({ set }) => {
    try {
      const servicesPath = path.join(process.cwd(), "data/services.json");

      try {
        await access(servicesPath);
      } catch {
        set.status = 404;
        set.headers["Cache-Control"] = "no-cache";
        return {
          success: false,
          message: "Services data not found",
        };
      }

      const servicesData = JSON.parse(await readFile(servicesPath, "utf-8"));

      set.headers["Cache-Control"] = "no-store";
      set.headers["ETag"] = `"services-${Date.now()}"`;

      return {
        success: true,
        data: servicesData,
      };
    } catch (error) {
      console.error("Services API error:", error);
      set.status = 500;
      set.headers["Cache-Control"] = "no-cache";
      return {
        success: false,
        message: "Failed to retrieve services data",
      };
    }
  })
  .get("/api/testimonials", async ({ set }) => {
    try {
      const testimonialsPath = path.join(process.cwd(), "data/testimonials.json");

      try {
        await access(testimonialsPath);
      } catch {
        set.status = 404;
        set.headers["Cache-Control"] = "no-cache";
        return {
          success: false,
          message: "Testimonials data not found",
        };
      }

      const testimonialsData = JSON.parse(await readFile(testimonialsPath, "utf-8"));

      set.headers["Cache-Control"] = "no-store";
      set.headers["ETag"] = `"testimonials-${Date.now()}"`;

      return {
        success: true,
        data: testimonialsData,
      };
    } catch (error) {
      console.error("Testimonials API error:", error);
      set.status = 500;
      set.headers["Cache-Control"] = "no-cache";
      return {
        success: false,
        message: "Failed to retrieve testimonials data",
      };
    }
  })
  // Admin login endpoint
  .post("/api/admin/login", async ({ body, request, set }) => {
    try {
      const { username, password } = body as { username: string; password: string };

      // Get client IP
      const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

      // Check if IP is locked out
      if (isLockedOut(ip)) {
        set.status = 429;
        return {
          success: false,
          message: "Too many failed login attempts. Please try again later.",
        };
      }

      // Verify credentials
      const isValid = await verifyAdminCredentials(username, password);

      if (!isValid) {
        recordFailedAttempt(ip);
        set.status = 401;
        return {
          success: false,
          message: "Invalid username or password",
        };
      }

      // Clear failed attempts on successful login
      clearFailedAttempts(ip);

      // Generate JWT token
      const { token, expires } = generateToken(username);

      return {
        success: true,
        message: "Login successful",
        token,
        expires,
      };
    } catch (error) {
      console.error("Login error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Internal server error",
      };
    }
  })
  .get("/api/admin/validate", async ({ request, set }) => {
    const authResult = requireAuth(request.headers.get("authorization"));

    if (!authResult.success) {
      set.status = 401;
      return {
        success: false,
        message: authResult.error,
      };
    }

    return {
      success: true,
      user: authResult.user,
    };
  })
  // Admin API endpoints
  .post("/api/admin/services", async ({ body, request, set }) => {
    // Check authentication
    const authResult = requireAuth(request.headers.get("authorization"));
    if (!authResult.success) {
      set.status = 401;
      return { success: false, message: authResult.error };
    }
    try {
      const servicesPath = path.join(process.cwd(), "data/services.json");
      const services = JSON.parse(await readFile(servicesPath, "utf-8"));

      const serviceData = body as any;
      const existingIndex = services.findIndex((s: any) => s.id === serviceData.id);

      if (existingIndex >= 0) {
        services[existingIndex] = serviceData;
      } else {
        services.push(serviceData);
      }

      await writeFile(servicesPath, JSON.stringify(services, null, 2));

      return { success: true, message: "Service saved successfully" };
    } catch (error) {
      console.error("Admin services error:", error);
      set.status = 500;
      return { success: false, message: "Failed to save service" };
    }
  })
  .delete("/api/admin/services/:id", async ({ params, request, set }) => {
    // Check authentication
    const authResult = requireAuth(request.headers.get("authorization"));
    if (!authResult.success) {
      set.status = 401;
      return { success: false, message: authResult.error };
    }
    try {
      const servicesPath = path.join(process.cwd(), "data/services.json");
      const services = JSON.parse(await readFile(servicesPath, "utf-8"));

      const filteredServices = services.filter((s: any) => s.id !== params.id);

      await writeFile(servicesPath, JSON.stringify(filteredServices, null, 2));

      return { success: true, message: "Service deleted successfully" };
    } catch (error) {
      console.error("Admin services delete error:", error);
      set.status = 500;
      return { success: false, message: "Failed to delete service" };
    }
  })
  .post("/api/admin/portfolio", async ({ body, request, set }) => {
    // Check authentication
    const authResult = requireAuth(request.headers.get("authorization"));
    if (!authResult.success) {
      set.status = 401;
      return { success: false, message: authResult.error };
    }
    try {
      const portfolioPath = path.join(process.cwd(), "data/portfolio.json");
      const portfolio = JSON.parse(await readFile(portfolioPath, "utf-8"));

      const portfolioData = body as any;
      const existingIndex = portfolio.findIndex((p: any) => p.id === portfolioData.id);

      if (existingIndex >= 0) {
        portfolio[existingIndex] = portfolioData;
      } else {
        portfolio.push(portfolioData);
      }

      await writeFile(portfolioPath, JSON.stringify(portfolio, null, 2));

      return { success: true, message: "Portfolio saved successfully" };
    } catch (error) {
      console.error("Admin portfolio error:", error);
      set.status = 500;
      return { success: false, message: "Failed to save portfolio" };
    }
  })
  .delete("/api/admin/portfolio/:id", async ({ params, request, set }) => {
    // Check authentication
    const authResult = requireAuth(request.headers.get("authorization"));
    if (!authResult.success) {
      set.status = 401;
      return { success: false, message: authResult.error };
    }
    try {
      const portfolioPath = path.join(process.cwd(), "data/portfolio.json");
      const portfolio = JSON.parse(await readFile(portfolioPath, "utf-8"));

      const filteredPortfolio = portfolio.filter((p: any) => p.id !== params.id);

      await writeFile(portfolioPath, JSON.stringify(filteredPortfolio, null, 2));

      return { success: true, message: "Portfolio deleted successfully" };
    } catch (error) {
      console.error("Admin portfolio delete error:", error);
      set.status = 500;
      return { success: false, message: "Failed to delete portfolio" };
    }
  })
  .post("/api/admin/testimonials", async ({ body, request, set }) => {
    // Check authentication
    const authResult = requireAuth(request.headers.get("authorization"));
    if (!authResult.success) {
      set.status = 401;
      return { success: false, message: authResult.error };
    }
    try {
      const testimonialsPath = path.join(process.cwd(), "data/testimonials.json");
      const testimonials = JSON.parse(await readFile(testimonialsPath, "utf-8"));

      const testimonialData = body as any;
      const existingIndex = testimonials.findIndex((t: any) => t.id === testimonialData.id);

      if (existingIndex >= 0) {
        testimonials[existingIndex] = testimonialData;
      } else {
        testimonials.push(testimonialData);
      }

      await writeFile(testimonialsPath, JSON.stringify(testimonials, null, 2));

      return { success: true, message: "Testimonial saved successfully" };
    } catch (error) {
      console.error("Admin testimonials error:", error);
      set.status = 500;
      return { success: false, message: "Failed to save testimonial" };
    }
  })
  .delete("/api/admin/testimonials/:id", async ({ params, request, set }) => {
    // Check authentication
    const authResult = requireAuth(request.headers.get("authorization"));
    if (!authResult.success) {
      set.status = 401;
      return { success: false, message: authResult.error };
    }
    try {
      const testimonialsPath = path.join(process.cwd(), "data/testimonials.json");
      const testimonials = JSON.parse(await readFile(testimonialsPath, "utf-8"));

      const filteredTestimonials = testimonials.filter((t: any) => t.id !== params.id);

      await writeFile(testimonialsPath, JSON.stringify(filteredTestimonials, null, 2));

      return { success: true, message: "Testimonial deleted successfully" };
    } catch (error) {
      console.error("Admin testimonials delete error:", error);
      set.status = 500;
      return { success: false, message: "Failed to delete testimonial" };
    }
  })
  .post("/api/contact", async ({ body, request }) => {
    try {
      // Get client IP for rate limiting
      const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

      const response = await handleContactSubmission(body, ip);
      return response;
    } catch (error) {
      console.error("Contact form error:", error);

      // Return appropriate error response
      if (error instanceof Error) {
        if (error.message.includes("Rate limit")) {
          return new Response(
            JSON.stringify({
              success: false,
              message: error.message,
            }),
            {
              status: 429,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        if (error.message.includes("Validation failed")) {
          return new Response(
            JSON.stringify({
              success: false,
              message: error.message,
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      }

      // Generic server error
      return new Response(
        JSON.stringify({
          success: false,
          message: "An error occurred while processing your request. Please try again later.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  })
  // Static file serving with caching headers
  .get("/", async () => {
    return new Response(await readFile(path.join(process.cwd(), "public/index.html")), {
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "public, max-age=300", // 5 minutes for HTML
      },
    });
  })
  .get("/admin", async () => {
    return new Response(await readFile(path.join(process.cwd(), "public/admin.html")), {
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "public, max-age=300", // 5 minutes for HTML
      },
    });
  })
  .get("/admin.html", async () => {
    return new Response(await readFile(path.join(process.cwd(), "public/admin.html")), {
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "public, max-age=300", // 5 minutes for HTML
      },
    });
  })
  .get("/login", async () => {
    return new Response(await readFile(path.join(process.cwd(), "public/login.html")), {
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "public, max-age=300", // 5 minutes for HTML
      },
    });
  })
  .get("/login.html", async () => {
    return new Response(await readFile(path.join(process.cwd(), "public/login.html")), {
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "public, max-age=300", // 5 minutes for HTML
      },
    });
  })
  .listen(process.env.PORT || 3000);

console.log(`🚀 Solvia Nova Portfolio is running at http://localhost:${process.env.PORT || 3000}`);

// Export for Vercel
export default app;
