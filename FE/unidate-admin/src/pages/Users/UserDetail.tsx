import React from 'react';
import { useParams } from 'react-router-dom';
import { getUserById } from '../../services/users';
import { User } from '../../types';

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const fetchedUser = await getUserById(id);
        setUser(fetchedUser);
      } catch (err) {
        setError('Failed to fetch user details');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      {user ? (
        <div>
          <h1>{user.name}</h1>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
          {/* Add more user details as needed */}
        </div>
      ) : (
        <div>User not found</div>
      )}
    </div>
  );
};

export default UserDetail;