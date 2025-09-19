import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PanoramaViewer } from '@/components/PanoramaViewer';
import { InteractiveMap } from '@/components/InteractiveMap';
import { LocationModal } from '@/components/LocationModal';
import { locations, getLocationById } from '@/data/locations';

const TourPage: React.FC = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();

  // Default to main tumski location if no locationId provided
  const currentLocationId = locationId || 'tumski01'; // Changed to tumski01 for better default
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  console.log('🔍 TourPage debug:', { locationId, currentLocationId });
  const currentLocation = getLocationById(currentLocationId);
  console.log('🔍 Current location:', currentLocation);

  // Update URL when location changes
  const handleLocationChange = (newLocationId: string) => {
    const location = getLocationById(newLocationId);
    if (!location) return;

    // Determine the route prefix based on location type
    let routePrefix = '/tour';
    if (newLocationId.startsWith('tumski')) {
      routePrefix = '/tumski';
    } else if (newLocationId.startsWith('dwor')) {
      routePrefix = '/dwor';
    } else if (newLocationId.startsWith('ogrod')) {
      routePrefix = '/ogrod';
    }

    navigate(`${routePrefix}/${newLocationId}`, { replace: true });
  };

  // Handle geomarker clicks
  const handleGeomarkerClick = (locationId: string) => {
    setSelectedLocation(locationId);
  };

  // Close modal and optionally navigate
  const handleModalClose = (navigateToLocation?: string) => {
    setSelectedLocation(null);
    if (navigateToLocation) {
      handleLocationChange(navigateToLocation);
    }
  };

  // Open interactive map
  const handleMapOpen = () => {
    setIsMapOpen(true);
  };

  if (!currentLocation) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-2xl font-medieval mb-4">Location not found</h1>
          <p>The requested location could not be found.</p>
          <button
            onClick={() => navigate('/tour/tumski')}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
          >
            Return to main tour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-black">
      {/* Main panorama viewer */}
      <PanoramaViewer
        locationId={currentLocationId}
        onLocationChange={handleLocationChange}
        onMapOpen={handleMapOpen}
        className="w-full h-full"
      />

      {/* Interactive map overlay */}
      {isMapOpen && (
        <InteractiveMap
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          currentLocationId={currentLocationId}
          onLocationSelect={handleLocationChange}
          backgroundImage="/images/panoramas/map.jpg" // Correct overview map image
        />
      )}

      {/* Location detail modal */}
      {selectedLocation && (
        <LocationModal
          locationId={selectedLocation}
          isOpen={true}
          onClose={handleModalClose}
        />
      )}

    </div>
  );
};

export default TourPage;