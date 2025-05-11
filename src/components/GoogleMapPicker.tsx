
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Location {
  lat: number;
  lng: number;
}

interface GoogleMapPickerProps {
  initialLocation?: Location;
  onSelectLocation: (location: Location, address?: string) => void;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

//Declaring var for initial instance of marker
var prevMarker;           //var is used, so that it can be accessed globally inside any func., and value is re-assignable/modifiable
// var prevSrchMarker;
// var prevCurrMarker;

const GoogleMapPicker: React.FC<GoogleMapPickerProps> = ({ initialLocation, onSelectLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  // if "const" is used then marker cannot be re-assigned any value, so marker will always remain null, same for all the following
  let [map, setMap] = useState<any>(null);
  let [marker, setMarker] = useState<any>(null);
  let [searchInput, setSearchInput] = useState('');
  let [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation || null);
  let [selectedAddress, setSelectedAddress] = useState<string>('');
  
  // Default location (center of map if none provided)
  const defaultLocation = { lat: 37.7749, lng: -122.4194 }; // San Francisco

  // Function to perform reverse geocoding
  const getAddressFromLocation = (location: Location) => {
    if (!window.google) return;
    
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ 'location': location }, (results: any, status: any) => {
      if (status === 'OK') {
        if (results[0]) {
          const address = results[0].formatted_address;
          setSelectedAddress(address);
          onSelectLocation(location, address);
        }
      } else {
        console.error('Geocoder failed due to: ' + status);
        onSelectLocation(location); // Still pass the location even if geocoding fails
      }
    });
  };

  useEffect(() => {
    // Create script tag to load Google Maps
    const googleMapScript = document.createElement('script');

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error('Google Maps API key is missing');
      toast.error('Map configuration error. Please contact support.');
      return;
    }

    googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
    googleMapScript.async = true;
    googleMapScript.defer = true;

    // Initialize map when script loads
    window.initMap = () => {
      if (mapRef.current) {
        const mapOptions = {
          center: selectedLocation || defaultLocation,
          zoom: 14,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        };
        
        const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
        setMap(newMap);
        
        // Add marker if we have an initial location
        if (selectedLocation) {
          const newMarker = new window.google.maps.Marker({
            position: selectedLocation,
            map: newMap,
            draggable: true,
            animation: window.google.maps.Animation.DROP
          });

          setMarker(newMarker);
         
          //Storing initial instance of marker
          prevMarker = newMarker;
          // prevSrchMarker = newMarker;
          // prevCurrMarker = newMarker;

          // Get address for initial location
          getAddressFromLocation(selectedLocation);
          
          // Add click handler to remove marker
          newMarker.addListener('click', function() {
            newMarker.setMap(null);
            setSelectedLocation(null);
          });
          
          // Update location when marker is dragged
          newMarker.addListener('dragend', function() {
            const position = newMarker.getPosition();
            const newLocation = {
              lat: position.lat(),
              lng: position.lng()
            };
            setSelectedLocation(newLocation);
            getAddressFromLocation(newLocation);
          });
        }

        // Add click event to place/move marker
        newMap.addListener('click', (e: any) => {

          const newLocation = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
          };
          
          // Remove existing marker if exists
          if (prevMarker) {
            prevMarker.setMap(null);
          }
          // console.log("prevMarker on Click", prevMarker)
          // console.log("prevSrchMarker on Click", prevSrchMarker)
          // console.log("prevCurrMarker on Click", prevCurrMarker)
          console.log("Marker = Click loc: ", marker)
          if (marker) {
            marker.setMap(null)
          }

          setSelectedLocation(newLocation);

          // Create new marker
          const newMarker = new window.google.maps.Marker({
            position: newLocation,
            map: newMap,
            draggable: true,
            animation: window.google.maps.Animation.DROP
          });

          // Storing initial instance of marker after update
          prevMarker = newMarker;
          // console.log("NewMarker = Update on Click loc: ",newMarker)
          // console.log("Marker = Update on Click loc: ", marker)

          setMarker(newMarker);

          // Get address for clicked location
          getAddressFromLocation(newLocation);
          
          // Add click handler to remove marker
          newMarker.addListener('click', function() {
            newMarker.setMap(null);
            setSelectedLocation(null);
          });
          
          // Update location when marker is dragged
          newMarker.addListener('dragend', function() {
            const position = newMarker.getPosition();
            const newLocation = {
              lat: position.lat(),
              lng: position.lng()
            };
            setSelectedLocation(newLocation);
            getAddressFromLocation(newLocation);
          });
        });
      }
    };
    
    document.head.appendChild(googleMapScript);
    
    return () => {
      // Clean up script tag
      googleMapScript.remove();
      window.initMap = () => {};
    };
  }, []);


  let handleSearch = () => {
    if (!map || !searchInput) return;
    
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchInput }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const newLocation = {
          lat: location.lat(),
          lng: location.lng()
        };

        // Move map to new location
        map.setCenter(newLocation);
        
        // Remove existing marker if exists
        // console.log("Marker = Search loc: ", marker)
        if(marker) {
          marker.setMap(null);
          // console.log("Marker = After Search loc removal: ", marker)
        }
        if (prevMarker) {
          prevMarker.setMap(null);
        }

        setSelectedLocation(newLocation);

        // Create new marker
        const newMarker = new window.google.maps.Marker({
          position: newLocation,
          map: map,
          draggable: true,
          animation: window.google.maps.Animation.DROP
        });

        prevMarker = newMarker;
        // prevSrchMarker = newMarker;
        // console.log("prevSrchMarker on Srch", prevSrchMarker)
        // console.log("NewMarker = Update on Search loc: ", newMarker)
        // console.log("PrevMarker =  Update on Search loc: ", prevMarker)

        setMarker(newMarker);

        // Get address from search result
        const address = results[0].formatted_address;
        setSelectedAddress(address);
        onSelectLocation(newLocation, address);
        
        // Add click handler to remove marker
        newMarker.addListener('click', function() {
          newMarker.setMap(null);
          setSelectedLocation(null);
        });
        
        // Update location when marker is dragged
        newMarker.addListener('dragend', function() {
          const position = newMarker.getPosition();
          const newLocation = {
            lat: position.lat(),
            lng: position.lng()
          };
          setSelectedLocation(newLocation);
          getAddressFromLocation(newLocation);
        });
      }
    });
  };


  let handleGetCurrentLocation = () => {
    if (navigator.geolocation && map) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          // Move map to new location
          map.setCenter(newLocation);
          // prevCurrLocation = prevMarker.getPosition();

          // Remove existing marker if exists
          // console.log("Marker = Curr loc: ", marker)
          if(marker) {
            marker.setMap(null);
            // console.log("Marker = After Curr loc removal: ", marker)
          }
          if (prevMarker) {
            prevMarker.setMap(null);
          }

          setSelectedLocation(newLocation);

          // Create new marker
          const newMarker = new window.google.maps.Marker({
            position: newLocation,
            map: map,
            draggable: true,
            animation: window.google.maps.Animation.DROP
          });
          
          prevMarker = newMarker;
          // prevCurrMarker = newMarker;
          // console.log("prevCurrMarker on Curr", prevCurrMarker)
          // console.log("PrevMarker = After 1st on Curr loc: ", prevMarker)
          // console.log("Marker = Update on Curr loc: ", marker)

          setMarker(newMarker);

          // Get address for current location
          getAddressFromLocation(newLocation);
          
          // Add click handler to remove marker
          newMarker.addListener('click', function() {
            newMarker.setMap(null);
            setSelectedLocation(null);
          });
          
          // Update location when marker is dragged
          newMarker.addListener('dragend', function() {
            const position = newMarker.getPosition();
            const newLocation = {
              lat: position.lat(),
              lng: position.lng()
            };
            setSelectedLocation(newLocation);
            getAddressFromLocation(newLocation);
          });
        },
        () => {
          console.error('Error getting current location');
        }
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search for address..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button type="button" onClick={handleSearch}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
        <Button type="button" variant="outline" onClick={handleGetCurrentLocation}>
          <MapPin className="h-4 w-4 mr-2" />
          Current Location
        </Button>
      </div>
      
      <div 
        ref={mapRef} 
        className="h-[400px] w-full rounded-md border border-gray-200"
      ></div>
      
      {selectedLocation && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input 
                id="latitude" 
                value={selectedLocation.lat.toFixed(6)} 
                readOnly 
              />
            </div>
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input 
                id="longitude" 
                value={selectedLocation.lng.toFixed(6)} 
                readOnly 
              />
            </div>
          </div>
          
          {selectedAddress && (
            <div>
              <Label htmlFor="address">Selected Address</Label>
              <Input 
                id="address" 
                value={selectedAddress} 
                readOnly 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GoogleMapPicker;
