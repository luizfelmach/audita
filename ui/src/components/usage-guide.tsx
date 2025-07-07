import { Badge } from "./ui/badge";

export function UsageGuide() {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Usage Guide</h3>
        <p className="text-sm text-gray-600 mt-1">
          How to create effective filters with custom keys and types
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                String
              </Badge>
              <span className="font-medium text-gray-900">Text Fields</span>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <strong>Common keys:</strong> message, user, service
              </li>
              <li>
                <strong>Equals:</strong> Exact match
              </li>
              <li>
                <strong>Contains:</strong> Substring search
              </li>
              <li>
                <strong>Regex:</strong> Regular expression
              </li>
            </ul>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                Integer
              </Badge>
              <span className="font-medium text-gray-900">Numeric Fields</span>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <strong>Common keys:</strong> status_code, duration, bytes
              </li>
              <li>
                <strong>Greater than:</strong> Higher value
              </li>
              <li>
                <strong>Between:</strong> Value range
              </li>
              <li>
                <strong>Equals:</strong> Exact value
              </li>
            </ul>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Badge
                variant="outline"
                className="bg-purple-50 text-purple-700 border-purple-200"
              >
                Date
              </Badge>
              <span className="font-medium text-gray-900">Date Fields</span>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <strong>Common keys:</strong> timestamp, created_at
              </li>
              <li>
                <strong>After:</strong> Later date
              </li>
              <li>
                <strong>Between:</strong> Specific period
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
