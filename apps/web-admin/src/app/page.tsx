'use client';

import { Card, Button } from '@whiskey-bent/ui';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600">0</p>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Games</h3>
            <p className="text-3xl font-bold text-green-600">0</p>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Bonuses Claimed</h3>
            <p className="text-3xl font-bold text-purple-600">0</p>
          </Card>
        </div>

        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">System Status</h2>
          <p className="text-gray-600 mb-4">Admin dashboard is currently in development.</p>
          <Button>Refresh Data</Button>
        </Card>
      </div>
    </div>
  );
}
