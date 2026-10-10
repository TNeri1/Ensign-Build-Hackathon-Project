import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { RequireRole } from './auth/RequireRole';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Search } from './pages/public/Search';
import { ReportLost } from './pages/public/ReportLost';
import { Outbox } from './pages/Outbox';
import { Claim } from './pages/public/Claim';
import { Claims } from './pages/staff/Claims';
import { ClaimReview } from './pages/staff/ClaimReview';
import { Pickup } from './pages/staff/Pickup';
import { Retention } from './pages/admin/Retention';
import { ItemList } from './pages/staff/ItemList';
import { Intake } from './pages/staff/Intake';
import { Bins } from './pages/staff/Bins';
import { BinLabel } from './pages/staff/BinLabel';
import { ItemDetail } from './pages/staff/ItemDetail';

const staff = (el: JSX.Element) => <RequireRole role="staff">{el}</RequireRole>;

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="search" element={<Search />} />
            <Route path="report" element={<ReportLost />} />
            <Route path="outbox" element={<Outbox />} />
            <Route path="claim/:token" element={<Claim />} />
            <Route path="login" element={<Login />} />
            <Route path="staff" element={staff(<ItemList />)} />
            <Route path="staff/intake" element={staff(<Intake />)} />
            <Route path="staff/bins" element={staff(<Bins />)} />
            <Route path="staff/bins/:code/label" element={staff(<BinLabel />)} />
            <Route path="staff/claims" element={staff(<Claims />)} />
            <Route path="staff/claims/:id" element={staff(<ClaimReview />)} />
            <Route path="staff/pickup" element={staff(<Pickup />)} />
            <Route path="admin/retention" element={<RequireRole role="admin"><Retention /></RequireRole>} />
            <Route path="staff/items/:id" element={staff(<ItemDetail />)} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
