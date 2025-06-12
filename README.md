# Lecture Portal

This project is a simple web portal for students to access lecture materials and tests for the "Information Technology II" (情報技術II) and "Information Technology III" (情報技術III) courses.

## Page URL

You can access the portal here: [https://krminfinity.github.io/info-tech-portal/] 


## Project Structure

The main entry point is `index.html`. This page links to course-specific index pages.

Due to improvements for development and deployment, the primary course content is now organized into directories with English names:

-   `information_technology_2/`: Contains materials for "Information Technology II".
    -   `index.html`: Main page for Information Technology II.
    -   `class1.html`: Content specific to Group 1.
    -   `class2.html`: Content specific to Group 2.
-   `information_technology_3/`: Contains materials for "Information Technology III".
    -   `index.html`: Main page for Information Technology III.
    -   `class1.html`: Content specific to Group 1.
    -   `class2.html`: Content specific to Group 2.

**Important Note on Directory Names:**
The original Japanese-named directories (`情報技術II/`, `情報技術III/`) still exist in the repository. This is due to technical limitations encountered with the automated tools used for renaming paths with non-ASCII characters. These original directories were not modified with the latest design updates. It is recommended to **use the content within the English-named directories** (`information_technology_2/` and `information_technology_3/`) and, if desired, manually delete the old Japanese-named directories from your local copy or repository. All links in the main `index.html` and within the new course pages have been updated to point to these English-named paths.

## Design and Responsiveness

The portal's user interface has been updated and built using **Bootstrap 5** to ensure a clean, modern look and feel, as well as responsiveness across various devices (desktops, tablets, and mobile phones).

Key design improvements include:
-   **Modernized Styling:** Updated button styles, spacing, and use of shadows for better visual hierarchy.
-   **Improved Mobile Usability:** Larger tap targets for buttons and optimized text readability on smaller screens.
-   **Consistent Navigation:** A clear and consistent navigation bar is present across all pages.
-   **Responsive Layout:** Content adapts to different screen sizes, ensuring a good user experience on any device. The viewport meta tag is correctly configured.

## Password Protection

The group-specific pages (e.g., `information_technology_2/class1.html`) are password protected. The password check is handled via client-side JavaScript.


## Progressive Web App (PWA) Features

This portal is configured as a Progressive Web App (PWA). It includes:
-   A `manifest.json` file, which describes the application and allows it to be added to the home screen on supported devices.
-   A `service-worker.js` file, which can enable offline capabilities and improve performance by caching assets.

This means the portal can be "installed" on a device for easier access, and potentially work offline if the service worker is configured for it.

## Future Improvements

Some potential areas for future improvement include:
-   **More Secure Authentication:** Implementing a server-side authentication system instead of hardcoded passwords in HTML.
-   **Dynamic Content Loading:** Fetching course materials or test links from a database or external files, rather than hardcoding them in each HTML page.
-   **Further UI/UX Enhancements:** Continuously refining the visual design and user experience based on feedback.
-   **Admin Interface:** A way for instructors to manage courses, groups, and passwords without directly editing HTML files.
-   **Full Offline Support:** Enhancing the service worker to cache all necessary resources for complete offline access to materials.
-   **Streamline Directory Structure:** Resolve the co-existence of Japanese and English named directories by removing the outdated Japanese-named ones once tooling or manual processes allow.
