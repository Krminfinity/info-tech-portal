# Lecture Portal

This project is a simple web portal for students to access lecture materials and tests for the "Information Technology II" (情報技術II) and "Information Technology III" (情報技術III) courses.

## Page URL

You can access the portal here: [YOUR_PAGE_URL_HERE] 
(Please replace `[YOUR_PAGE_URL_HERE]` with the actual URL where the portal is deployed.)

## Project Structure

The main entry point is `index.html`, which links to the course-specific pages:
-   `情報技術II/index.html` for Information Technology II
-   `情報技術III/index.html` for Information Technology III

Each course directory contains HTML files for different groups (e.g., `情報技術II/1組.html` for Group 1 of Information Technology II).

## Password Protection

The group-specific pages (e.g., `情報技術II/1組.html`) are password protected. The passwords are currently hardcoded directly in the HTML files. For example, the password for `情報技術II/1組.html` is `ii1passZk`.

**Note:** This is a basic form of protection. For more sensitive information or a larger user base, a more robust authentication system would be recommended.

## Progressive Web App (PWA) Features

This portal is configured as a Progressive Web App (PWA). It includes:
-   A `manifest.json` file, which describes the application and allows it to be added to the home screen on supported devices.
-   A `service-worker.js` file, which can enable offline capabilities and improve performance by caching assets.

This means the portal can be "installed" on a device for easier access, and potentially work offline if the service worker is configured for it.

## Future Improvements

Some potential areas for future improvement include:
-   **More Secure Authentication:** Implementing a server-side authentication system instead of hardcoded passwords in HTML.
-   **Dynamic Content Loading:** Fetching course materials or test links from a database or external files, rather than hardcoding them in each HTML page.
-   **Improved User Interface:** Enhancing the visual design and user experience.
-   **Admin Interface:** A way for instructors to manage courses, groups, and passwords without directly editing HTML files.
-   **Full Offline Support:** Enhancing the service worker to cache all necessary resources for complete offline access to materials.
