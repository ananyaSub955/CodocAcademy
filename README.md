# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

For displaying the specialties - Logic:
[
  { Category: "A", Subcategory: "X", SubTopics: "1" },
  { Category: "A", Subcategory: "X", SubTopics: "2" },
  { Category: "A", Subcategory: "Y", SubTopics: "3" },
  { Category: "B", Subcategory: "Z", SubTopics: "4" },
]
Then structuredData becomes:

js
Copy
Edit
{
  A: {
    X: [ {SubTopics: "1"}, {SubTopics: "2"} ],
    Y: [ {SubTopics: "3"} ]
  },
  B: {
    Z: [ {SubTopics: "4"} ]
  }
}


LINKS: 
- https://mdbootstrap.com/snippets/standard/mdbootstrap/2885113?view=side
- https://www.youtube.com/watch?v=943D7U74_sQ
- https://fonts.google.com/selection/embed