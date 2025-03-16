"use client";

import { useState } from "react";
import { Clock, Calendar, ChevronRight } from "lucide-react";

export default function HealthDashboard() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#0367A3]">Overview</h1>
        <p className="text-[#0367A3]/80">Your health summary and recent activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appointments Summary */}
        <div className="border rounded-lg p-6 bg-[#B1E1DE] shadow-md">
          <div className="flex items-center gap-2 pb-3 border-b border-[#0367A3]/40">
            <Clock className="h-5 w-5 text-[#0367A3]" />
            <h3 className="font-medium text-[#0367A3]">Appointments Summary</h3>
          </div>
          <p className="text-sm text-[#0367A3]/80 mt-2">Your upcoming and past appointments</p>
          <div className="mt-4 space-y-4">
            <div className="flex gap-4">
              <div className="bg-[#0367A3]/10 rounded-full p-3 h-12 w-12 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-[#0367A3]" />
              </div>
              <div>
                <h4 className="font-medium text-[#0367A3]">Upcoming Appointment</h4>
                <p className="text-sm text-[#0367A3]/80">March 18, 2025 • 10:30 AM</p>
                <p className="text-sm text-[#0367A3]/90">Dr. Smith • <span className="text-[#0367A3]">Annual Check-up</span></p>
              </div>
            </div>
          </div>
          <button className="w-full flex items-center justify-center py-2 mt-4 text-[#0367A3] hover:bg-[#0367A3]/10 rounded-md transition-colors">
            <span>View All Appointments</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>

        {/* Recent Activity */}
        <div className="border rounded-lg p-6 bg-white shadow-md">
          <div className="flex items-center gap-2 pb-3 border-b border-[#0367A3]/40">
            <Clock className="h-5 w-5 text-[#0367A3]" />
            <h3 className="font-medium text-[#0367A3]">Recent Activity</h3>
          </div>
          <p className="text-sm text-[#0367A3]/80 mt-2">Your recent health-related activities</p>
          <div className="mt-4 space-y-4">
            <div className="flex gap-4">
              <div className="bg-[#0367A3]/10 rounded-full p-3 h-12 w-12 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-[#0367A3]" />
              </div>
              <div>
                <h4 className="font-medium text-[#0367A3]">Appointment Scheduled</h4>
                <p className="text-sm">Annual check-up with Dr. Smith</p>
                <p className="text-sm text-[#0367A3]/80">March 10, 2025</p>
              </div>
            </div>
          </div>
          <button className="w-full flex items-center justify-center py-2 mt-4 text-[#0367A3] hover:bg-[#0367A3]/10 rounded-md transition-colors">
            <span>View All Activity</span>
          </button>
        </div>
      </div>
    </div>
  );
}
