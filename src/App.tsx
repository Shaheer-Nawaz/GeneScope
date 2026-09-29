import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Simulator from '@/pages/Simulator';
import ParentCross from '@/pages/ParentCross';
import MonteCarlo from '@/pages/MonteCarlo';
import MutationLab from '@/pages/MutationLab';
import About from '@/pages/About';
import ModelAssumptions from '@/pages/ModelAssumptions';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/cross" element={<ParentCross />} />
          <Route path="/montecarlo" element={<MonteCarlo />} />
          <Route path="/mutation" element={<MutationLab />} />
          <Route path="/about" element={<About />} />
          <Route path="/assumptions" element={<ModelAssumptions />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
