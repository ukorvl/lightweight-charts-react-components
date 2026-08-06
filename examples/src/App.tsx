import { Suspense, lazy } from "react";
import { Route, Router, Switch } from "wouter";
import { lazyWithRetry } from "./common/lazyWithRetry";
import { Layout } from "./Layout";
import { Index } from "./pages/index/Index";
import { Page404 } from "./pages/Page404";
import { ProgressBox } from "./ui/ProgressBox";
import type { RouteComponentProps } from "wouter";

const Terminal = lazyWithRetry(() => import("./pages/Terminal"), "Terminal");
const DocsIndexRouteModule = lazy(() =>
  import("./pages/docs/DocsRoutes").then(module => ({ default: module.DocsIndexRoute }))
);
const DocsSegmentRouteModule = lazy(() =>
  import("./pages/docs/DocsRoutes").then(module => ({ default: module.DocsSegmentRoute }))
);
const DocsVersionTopicRouteModule = lazy(() =>
  import("./pages/docs/DocsRoutes").then(module => ({
    default: module.DocsVersionTopicRoute,
  }))
);

const TerminalLazy = () => {
  return (
    <Suspense fallback={<ProgressBox />}>
      <Terminal />
    </Suspense>
  );
};

const DocsIndexRoute = () => {
  return (
    <Suspense fallback={<ProgressBox />}>
      <DocsIndexRouteModule />
    </Suspense>
  );
};

const DocsSegmentRoute = (props: RouteComponentProps<{ segment: string }>) => {
  return (
    <Suspense fallback={<ProgressBox />}>
      <DocsSegmentRouteModule {...props} />
    </Suspense>
  );
};

const DocsVersionTopicRoute = (
  props: RouteComponentProps<{ segment: string; topic: string }>
) => {
  return (
    <Suspense fallback={<ProgressBox />}>
      <DocsVersionTopicRouteModule {...props} />
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
