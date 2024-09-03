import Home from '@/pages/Home'
import Auth from '@/pages/Auth'
import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom'

const routes = (
  <Route path="/" >
    <Route index element={< Home />} />
    < Route path="auth" >
      <Route index element={< Auth mode="login" />} />
      < Route path="register" element={< Auth mode="register" />} />
      < Route path="login" element={< Auth mode="login" />} />
    </Route>
  </Route>
);

const router = createBrowserRouter(
  createRoutesFromElements(
    routes
  )
)
export default router
