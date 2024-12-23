const AcheteurController = require('../acheteurController'); // Adjust the path as needed
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

describe('AcheteurController', () => {
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
     * Tests for createAcheteur
     */
    describe('createAcheteur', () => {
        test('should return 400 if "nom" is missing', async () => {
            req.body = { prenom: 'John', email: 'test@test.com', adresse: '123456789' };

            await AcheteurController.createAcheteur(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Le nom est requis.' });
        });

        test('should return 400 if email is invalid', async () => {
            req.body = { nom: 'John', prenom: 'Doe', email: 'invalid', adresse: '123456789' };

            await AcheteurController.createAcheteur(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'L\'email fourni n\'est pas valide.' });
        });

        test('should return 400 if acheteur already exists', async () => {
            req.body = { nom: 'John', prenom: 'Doe', email: 'test@test.com', adresse: '123456789' };

            mockCollection.findOne.mockResolvedValueOnce({ _id: 'mockId' });

            await AcheteurController.createAcheteur(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Cet acheteur existe déjà.' });
        });

        test('should return 201 if acheteur is created successfully', async () => {
            req.body = { nom: 'John', prenom: 'Doe', email: 'test@test.com', adresse: '123456789' };

            mockCollection.findOne.mockResolvedValueOnce(null); // No existing acheteur
            mockCollection.insertOne.mockResolvedValueOnce({ insertedId: 'mockId' });

            await AcheteurController.createAcheteur(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'Acheteur créé avec succès.' });
        });
    });

    /**
     * Tests for getAcheteurById
     */
    describe('getAcheteurById', () => {
        test('should return 404 if acheteur is not found', async () => {
            req.params.id = 'mockId';

            mockCollection.findOne.mockResolvedValueOnce(null);

            await AcheteurController.getAcheteurById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Acheteur non trouvé.' });
        });

        test('should return 200 if acheteur is found', async () => {
            req.params.id = 'mockId';

            mockCollection.findOne.mockResolvedValueOnce({ _id: 'mockId', nom: 'John' });

            await AcheteurController.getAcheteurById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ _id: 'mockId', nom: 'John' });
        });
    });

    /**
     * Tests for getAllAcheteurs
     */
    test('should return 200 with all acheteurs', async () => {
        const acheteurs = [
            { _id: '1', nom: 'John' },
            { _id: '2', nom: 'Doe' },
        ];
    
        // Override the default mock to return specific data
        mockCollection.find.mockImplementation(() => ({
            toArray: jest.fn(() => Promise.resolve(acheteurs)),
        }));
    
        await AcheteurController.getAllAcheteurs(req, res);
    
        // Assert the mocked data is returned
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(acheteurs);
    });
    

    /**
     * Tests for updateAcheteur
     */
    describe('updateAcheteur', () => {
        test('should return 404 if acheteur is not found', async () => {
            req.params.id = 'mockId';
            req.body = { nom: 'Updated' };

            mockCollection.updateOne.mockResolvedValueOnce({ matchedCount: 0 });

            await AcheteurController.updateAcheteur(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Acheteur non trouvé.' });
        });

        test('should return 200 if acheteur is updated successfully', async () => {
            req.params.id = 'mockId';
            req.body = { nom: 'Updated' };

            mockCollection.updateOne.mockResolvedValueOnce({ matchedCount: 1 });

            await AcheteurController.updateAcheteur(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Acheteur mis à jour avec succès.' });
        });
    });

    /**
     * Tests for deleteAcheteur
     */
    describe('deleteAcheteur', () => {
        test('should return 404 if acheteur is not found', async () => {
            req.params.id = 'mockId';

            mockCollection.deleteOne.mockResolvedValueOnce({ deletedCount: 0 });

            await AcheteurController.deleteAcheteur(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Acheteur non trouvé.' });
        });

        test('should return 200 if acheteur is deleted successfully', async () => {
            req.params.id = 'mockId';

            mockCollection.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });

            await AcheteurController.deleteAcheteur(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Acheteur supprimé avec succès.' });
        });
    });
});
