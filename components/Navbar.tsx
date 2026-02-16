import { Box } from 'lucide-react'
import Button from './ui/Button'

const Navbar = () => {

    const isSignedIn =false;
    const username = "Sipha";

    const handleAuthClick = async () => {
        // Handle authentication logic here
    }

    return (
        <header className='navbar'>
            <nav className='inner'>
                <div className="left">
                    <div className="brand">
                        <Box className='logo' />
                        <span className="name">ShowRoom</span>
                    </div>

                    <ul className='links'>
                        <li><a href="#">Product</a></li>
                        <li><a href="#">Pricing</a></li>
                        <li><a href="#">Community</a></li>
                    </ul>
                </div>

                <div className="actions">

                    {isSignedIn && <span className='greeting'>{`Hi, ${username}`}</span>}
                    {isSignedIn ? (
                        <>
                            <Button text="Log out" onClick={handleAuthClick} variant="cta" />
                        </>
                    ) : (
                        <>
                            <Button text="Log in" onClick={handleAuthClick} variant='ghost' />
                            <Button text="Get Started" variant="cta" />
                        </>
                    )}

                </div>
            </nav>
        </header>
    )
}

export default Navbar