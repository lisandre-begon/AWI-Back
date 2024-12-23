const VendeurController = require('../vendeurController'); // Adjust the path as needed
const { MongoClient, ObjectId } = require('mongodb');

// Mock MongoDB client and its methods
jest.mock('mongodb', () => {
    const mCollection = {
        insertOne: jest.fn(),
        findOne: jest.fn(),
        find: jest.fn(() => ({ toArray: jest.fn() })),
        updateOne: jest.fn(),
        deleteOne: jest.fn(),
    };
    const mDb = { collection: jest.fn(() => mCollection) };
    const mClient = {
        connect: jest.fn(),
        db: jest.fn(() => mDb),
        close: jest.fn(),
    };
    const mObjectId = jest.fn(id => ({ id }));
    mObjectId.isValid = jest.fn(() => true); // Mock isValid function
    return { MongoClient: jest.fn(() => mClient), ObjectId: mObjectId };
});

describe('VendeurController', () => {
    let req, res, mockClient, mockCollection;

    beforeEach(() => {
        mockClient = new MongoClient();
        mockCollection = mockClient.db().collection();
        req = { body: {}, params: {} };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
    
        // Properly mock find().toArray()
        mockCollection.find = jest.fn(() => ({
            toArray: jest.fn(() => Promise.resolve([])), // Default empty array
        }));
    });
    
    

    afterEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Tests for createVendeur
     */
    describe('createVendeur', () => {
        test('should return 400 if "nom" is missing', async () => {
            req.body = { prenom: 'John', email: 'test@test.com', telephone: '123456789' };

            await VendeurController.createVendeur(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Le nom est requis.' });
        });

        test('should return 400 if email is invalid', async () => {
            req.body = { nom: 'John', prenom: 'Doe', email: 'invalid', telephone: '123456789' };

            await VendeurController.createVendeur(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'L\'email fourni n\'est pas valide.' });
        });

        test('should return 400 if vendeur already exists', async () => {
            req.body = { nom: 'John', prenom: 'Doe', email: 'test@test.com', telephone: '123456789' };

            mockCollection.findOne.mockResolvedValueOnce({ _id: 'mockId' });

            await VendeurController.createVendeur(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Ce vendeur existe déjà.' });
        });

        test('should return 201 if vendeur is created successfully', async () => {
            req.body = { nom: 'John', prenom: 'Doe', email: 'test@test.com', telephone: '123456789' };

            mockCollection.findOne.mockResolvedValueOnce(null); // No existing vendeur
            mockCollection.insertOne.mockResolvedValueOnce({ insertedId: 'mockId' });

            await VendeurController.createVendeur(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'Vendeur créé avec succès.' });
        });
    });

    /**
     * Tests for getVendeurById
     */
    describe('getVendeurById', () => {
        test('should return 404 if vendeur is not found', async () => {
            req.params.id = 'mockId';

            mockCollection.findOne.mockResolvedValueOnce(null);

            await VendeurController.getVendeurById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Vendeur non trouvé.' });
        });

        test('should return 200 if vendeur is found', async () => {
            req.params.id = 'mockId';

            mockCollection.findOne.mockResolvedValueOnce({ _id: 'mockId', nom: 'John' });

            await VendeurController.getVendeurById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ _id: 'mockId', nom: 'John' });
        });
    });

    /**
     * Tests for getAllVendeurs
     */
    test('should return 200 with all vendeurs', async () => {
        const vendeurs = [
            { _id: '1', nom: 'John' },
            { _id: '2', nom: 'Doe' },
        ];
    
        // Override the default mock to return specific data
        mockCollection.find.mockImplementation(() => ({
            toArray: jest.fn(() => Promise.resolve(vendeurs)),
        }));
    
        await VendeurController.getAllVendeurs(req, res);
    
        // Assert the mocked data is returned
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(vendeurs);
    });
    

    /**
     * Tests for updateVendeur
     */
    describe('updateVendeur', () => {
        test('should return 404 if vendeur is not found', async () => {
            req.params.id = 'mockId';
            req.body = { nom: 'Updated' };

            mockCollection.updateOne.mockResolvedValueOnce({ matchedCount: 0 });

            await VendeurController.updateVendeur(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Vendeur non trouvé.' });
        });

        test('should return 200 if vendeur is updated successfully', async () => {
            req.params.id = 'mockId';
            req.body = { nom: 'Updated' };

            mockCollection.updateOne.mockResolvedValueOnce({ matchedCount: 1 });

            await VendeurController.updateVendeur(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Vendeur mis à jour avec succès.' });
        });
    });

    /**
     * Tests for deleteVendeur
     */
    describe('deleteVendeur', () => {
        test('should return 404 if vendeur is not found', async () => {
            req.params.id = 'mockId';

            mockCollection.deleteOne.mockResolvedValueOnce({ deletedCount: 0 });

            await VendeurController.deleteVendeur(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Vendeur non trouvé.' });
        });

        test('should return 200 if vendeur is deleted successfully', async () => {
            req.params.id = 'mockId';

            mockCollection.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });

            await VendeurController.deleteVendeur(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Vendeur supprimé avec succès.' });
        });
    });
});
