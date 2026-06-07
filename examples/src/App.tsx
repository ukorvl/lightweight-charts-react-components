import { Suspense } from "react";
import { Route, Router, Switch } from "wouter";
import { lazyWithRetry } from "./common/lazyWithRetry";
import { Layout } from "./Layout";
import {
  DocsIndexRoute,
  DocsSegmentRoute,
  DocsVersionTopicRoute,
} from "./pages/docs/DocsRoutes";
import { Index } from "./pages/index/Index";
import { Page404 } from "./pages/Page404";
import { ProgressBox } from "./ui/ProgressBox";

const Terminal = lazyWithRetry(() => import("./pages/Terminal"), "Terminal");

const TerminalLazy = () => {
  return (
    <Suspense fallback={<ProgressBox />}>
      <Terminal />
    </Suspense>
  );
};

export const App = () => {
  return (
    <Router base={import.meta.env.VITE_BASE_URL}>
      <Layout>
        <Switch>
          <Route path="/" component={Index} />
          <Route path="/terminal" component={TerminalLazy} />
          <Route path="/docs" component={DocsIndexRoute} />
          <Route path="/docs/:segment/:topic" component={DocsVersionTopicRoute} />
          <Route path="/docs/:segment" component={DocsSegmentRoute} />
          <Route path="*" component={Page404} />
        </Switch>
      </Layout>
    </Router>
  );
};
