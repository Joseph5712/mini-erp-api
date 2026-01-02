mini-erp-api/
├── src/
│   ├── server.js
│   ├── app.js
│   ├── config/
│   │   ├── env.js
│   │   └── db.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── customers.routes.js
│   │   ├── products.routes.js
│   │   ├── orders.routes.js
│   │   └── reports.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── customers.controller.js
│   │   ├── products.controller.js
│   │   ├── orders.controller.js
│   │   └── reports.controller.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── customers.service.js
│   │   ├── products.service.js
│   │   ├── orders.service.js
│   │   └── reports.service.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── error.middleware.js
│   │   └── validate.middleware.js
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── customers.validator.js
│   │   ├── products.validator.js
│   │   └── orders.validator.js
│   └── utils/
│       └── jwt.js
├── .env
├── .gitignore
├── package.json
└── README.md
