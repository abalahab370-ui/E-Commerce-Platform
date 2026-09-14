# E-Commerce Admin Dashboard & API

This repository contains the frontend administration panel and backend API integration for managing an e-commerce platform. The project structure and architectural goals align with the standards outlined in the [roadmap.sh E-commerce API project](https://roadmap.sh/projects/ecommerce-api).

## Live Demo

* **Deployed Application**: [https://storedz-ui.onrender.com/](https://storedz-ui.onrender.com/)

## Core Features

The administrative interface currently features a comprehensive category management module (`CategoryManagement_3.jsx`)[cite: 13]. Its primary capabilities include:

* **Category CRUD Operations**: Create, read, update, and delete product categories via a unified form and responsive data table[cite: 13].
* **Promotional Banner Configuration**: Toggle categories as "Featured" to display hero banners directly on the storefront homepage[cite: 13].
* **Dynamic Content Mapping**: Custom fields for featured titles, subtitles, and call-to-action button text (defaulting to "Découvrir")[cite: 13].
* **Media Handling**: Native file input integration for uploading banner images, complete with real-time UI previews[cite: 13].
* **Error Handling & Feedback**: Integrated loading states, submission lockouts, and visible error messaging to ensure safe data entry[cite: 13].

## Technology Stack

| Layer | Technology | Application |
| :--- | :--- | :--- |
| **Frontend Framework** | React | Component-based UI architecture[cite: 13]. |
| **State Management** | React Hooks | Utilizes `useState`, `useEffect`, and `useCallback` for data fetching and form control[cite: 13]. |
| **Styling** | Inline CSS / CSS-in-JS | Responsive, grid-based layouts with standard web-safe typography[cite: 13]. |
| **API Communication** | `FormData` API | Packages text data and binary image files for multipart/form-data transmission[cite: 13]. |

## Getting Started

1. Clone this repository to your local environment.
2. Run `npm install` to install all required dependencies.
3. Verify that your backend server (handling the `api.getCategories`, `api.createCategory`, etc. routes) is running[cite: 13].
4. Execute `npm start` to launch the frontend development server.

## References & Useful Links

* **Live Frontend Interface**: [https://storedz-ui.onrender.com/](https://storedz-ui.onrender.com/)
* **API Architecture Reference**: [https://roadmap.sh/projects/ecommerce-api](https://roadmap.sh/projects/ecommerce-api)
