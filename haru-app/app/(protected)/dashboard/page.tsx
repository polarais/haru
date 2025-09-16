'use client'

export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Placeholder cards */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Calendar View</h2>
            <p className="text-gray-600">월별 감정 캘린더가 여기에 표시됩니다</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Timeline View</h2>
            <p className="text-gray-600">일기 타임라인이 여기에 표시됩니다</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-medium text-gray-900 mb-2">AI Insights</h2>
            <p className="text-gray-600">AI 분석 결과가 여기에 표시됩니다</p>
          </div>
        </div>
      </div>
    </div>
  )
}