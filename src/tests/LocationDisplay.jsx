// Prints the current URL (path + query string) so tests can check what the filters wrote to it.
// Kept in its own file because a file that defines a component should export only components.
import { useLocation } from 'react-router-dom'

function LocationDisplay() {
  const location = useLocation()
  return <p data-testid="location">{location.pathname + location.search}</p>
}

export default LocationDisplay