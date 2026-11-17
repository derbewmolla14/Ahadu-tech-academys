import { Navigate, useParams } from 'react-router-dom';

export default function UniversityDetail() {
  const { name } = useParams();

  if (!name || name === 'undefined' || name === 'null') {
    return <Navigate to="/universities" replace />;
  }

  // Skip the university information screen and open the student department flow.
  return <Navigate to={`/university/${name}/department?faculty=Natural`} replace />;
}
