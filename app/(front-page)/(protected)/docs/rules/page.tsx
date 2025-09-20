import { Card } from "@tremor/react";
import React from "react";

function RulesDocsPage() {
  return (
    <div className="space-y-6">
      <Card className="p-8">
        <h1 className="text-2xl font-bold mb-6">How to Set Up Alerts</h1>
        
        <div className="space-y-8">
          {/* When to Send Alerts */}
          <section>
            <h2 className="text-xl font-semibold mb-4">When Should We Send You an Alert?</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">Comparison Type</h3>
                <p>Choose how we check if something is wrong:</p>
                <ul className="list-disc ml-6 mt-2">
                  <li><strong>Higher than</strong> (&gt;) - Alert when value goes above your limit</li>
                  <li><strong>Lower than</strong> (&lt;) - Alert when value drops below your limit</li>
                  <li><strong>Exactly equals</strong> (==) - Alert when value matches exactly</li>
                  <li><strong>Getting worse quickly</strong> - Alert when things are declining fast</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-lg">Alert Limit</h3>
                <p>The number that triggers an alert (like 85% for CPU usage).</p>
                <p className="text-sm text-yellow-600 mt-1">⚠️ Too sensitive = too many alerts, not sensitive enough = you&#39;ll miss problems</p>
              </div>
            </div>
          </section>

          {/* How We Check */}
          <section>
            <h2 className="text-xl font-semibold mb-4">How We Check Your Systems</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">Time Window</h3>
                <p>How long we watch before deciding (like checking average over 5 minutes).</p>
                <p className="text-sm text-blue-600 mt-1">💡 Longer windows = smoother, less jumpy alerts</p>
              </div>
              
              <div>
                <h3 className="font-medium text-lg">Confirmation Checks</h3>
                <p>How many times in a row the problem must happen before we alert you.</p>
                <p className="text-sm text-green-600 mt-1">✅ Prevents false alarms from temporary blips</p>
              </div>
              
              <div>
                <h3 className="font-medium text-lg">How We Calculate</h3>
                <p>How we combine multiple readings:</p>
                <ul className="list-disc ml-6 mt-2">
                  <li><strong>Average</strong> - Smooth out spikes (good for CPU)</li>
                  <li><strong>Highest</strong> - Catch any spike (good for errors)</li>
                  <li><strong>Lowest</strong> - Catch any drop (good for uptime)</li>
                  <li><strong>Total</strong> - Add them all up (good for counts)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Managing Notifications */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Managing Your Notifications</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">Quiet Period</h3>
                <p>How long to wait before sending the same alert again (like every 15 minutes).</p>
                <p className="text-sm text-purple-600 mt-1">🔄 Stops us from spamming you with the same problem</p>
              </div>
              
              <div>
                <h3 className="font-medium text-lg">Maximum Alerts</h3>
                <p>The most alerts we#39;ll send you in one hour (safety limit).</p>
                <p className="text-sm text-red-600 mt-1">🛡️ Protects you from alert storms</p>
              </div>
            </div>
          </section>

          {/* Key Differences */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Two Important Timing Settings</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-lg text-blue-600">Confirmation Checks</h3>
                <p className="text-sm text-gray-600 mb-2">BEFORE sending first alert</p>
                <p>Makes sure the problem is real by checking multiple times.</p>
                <div className="mt-3 p-3 bg-blue-50 rounded">
                  <p className="text-sm font-medium">Example:</p>
                  <p className="text-sm">CPU high for 3 minutes straight → send alert</p>
                  <p className="text-sm">If CPU drops at minute 2 → start over, no alert</p>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-lg text-purple-600">Quiet Period</h3>
                <p className="text-sm text-gray-600 mb-2">AFTER sending first alert</p>
                <p>Waits before sending another alert about the same problem.</p>
                <div className="mt-3 p-3 bg-purple-50 rounded">
                  <p className="text-sm font-medium">Example:</p>
                  <p className="text-sm">First alert sent at 10:00 AM</p>
                  <p className="text-sm">With 15min quiet period → next alert at 10:15 AM earliest</p>
                </div>
              </div>
            </div>
          </section>
          
          {/* Summary */}
          <section className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Quick Summary</h2>
            <p className="mb-4">Think of alerts like a smoke detector for your systems:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Alert Limit</strong> - How much smoke before it beeps</li>
              <li><strong>Confirmation Checks</strong> - Make sure it&#39;s real smoke, not just steam</li>
              <li><strong>Quiet Period</strong> - Don&#39;t keep beeping every second once you know</li>
              <li><strong>Time Window</strong> - Look at the average smoke level, not just one moment</li>
            </ul>
          </section>
        </div>
      </Card>
    </div>
  );
}

export default RulesDocsPage;