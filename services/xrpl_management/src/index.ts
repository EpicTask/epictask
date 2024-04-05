import * as Koa from "koa";
import * as bodyParser from "koa-bodyparser";
import * as json from "koa-json";
import * as views from "@ladjs/koa-views";
import * as serve from "koa-static";


const app = new Koa();

// Middleware to handle json responses
app.use(json());
// Middleware to parse request bodies
app.use(bodyParser());

// Error handling middleware
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      error: err.message,
    };
  }
});

// Routes for wallet services


// app.use(views(path.join(__dirname, "../templates"), { extension: "ejs" })); // Replace 'ejs' with your template engine
// app.use(serve(path.join(__dirname, "../static")));
// Define a route to render an HTML page
app.use(async (ctx) => {
  // Replace 'template' with the name of your HTML template file (without the extension)
  await ctx.render("index", { title: "DREX" });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


// node --loader ts-node/esm --experimental-specifier-resolution=node ./dist/src/services/xrpLedger/account.js