const GestionnaireController = require('../gestionnaireController');
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

describe('GestionnaireController', () => {
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
     * Tests for createGestionnaire
     */
    describe('createGestionnaire', () => {
        test('should return 400 if "pseudo" is missing', async () => {
            req.body = { mot_de_passe: 'password123' };

            await GestionnaireController.createGestionnaire(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Le pseudo est requis.' });
        });

        test('should return 400 if "mot_de_passe" is missing', async () => {
            req.body = { pseudo: 'admin' };

            await GestionnaireController.createGestionnaire(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Le mot de passe est requis.' });
        });

        test('should return 400 if pseudo already exists', async () => {
            req.body = { pseudo: 'admin', mot_de_passe: 'password123' };

            mockCollection.findOne.mockResolvedValueOnce({ _id: 'mockId' });

            await GestionnaireController.createGestionnaire(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Ce pseudo est déjà utilisé.' });
        });

        test('should return 201 if gestionnaire is created successfully', async () => {
            req.body = { pseudo: 'admin', mot_de_passe: 'password123' };

            mockCollection.findOne.mockResolvedValueOnce(null); // No existing gestionnaire
            mockCollection.insertOne.mockResolvedValueOnce({ insertedId: 'mockId' });

            await GestionnaireController.createGestionnaire(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'Gestionnaire créé avec succès.' });
        });
    });

    /**
     * Tests for getGestionnaireById
     */
    describe('getGestionnaireById', () => {
        test('should return 404 if gestionnaire is not found', async () => {
            req.params.id = 'mockId';

            mockCollection.findOne.mockResolvedValueOnce(null);

            await GestionnaireController.getGestionnaireById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Gestionnaire non trouvé.' });
        });

        test('should return 200 if gestionnaire is found', async () => {
            req.params.id = 'mockId';

            mockCollection.findOne.mockResolvedValueOnce({ _id: 'mockId', pseudo: 'admin' });

            await GestionnaireController.getGestionnaireById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ _id: 'mockId', pseudo: 'admin' });
        });
    });

    /**
     * Tests for getAllGestionnaires
     */
    describe('getAllGestionnaires', () => {
        test('should return 200 with all gestionnaires', async () => {
            const gestionnaires = [
                { _id: '1', pseudo: 'admin1' },
                { _id: '2', pseudo: 'admin2' },
            ];

            // Mock the return value for find().toArray()
            mockCollection.find.mockImplementation(() => ({
                toArray: jest.fn(() => Promise.resolve(gestionnaires)),
            }));

            await GestionnaireController.getAllGestionnaires(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(gestionnaires);
        });
    });

    /**
     * Tests for updateGestionnaire
     */
    describe('updateGestionnaire', () => {
        test('should return 404 if gestionnaire is not found', async () => {
            req.params.id = 'mockId';
            req.body = { pseudo: 'updatedPseudo', mot_de_passe: 'updatedPassword' };

            mockCollection.updateOne.mockResolvedValueOnce({ matchedCount: 0 });

            await GestionnaireController.updateGestionnaire(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Gestionnaire non trouvé.' });
        });

        test('should return 200 if gestionnaire is updated successfully', async () => {
            req.params.id = 'mockId';
            req.body = { pseudo: 'updatedPseudo', mot_de_passe: 'updatedPassword' };

            mockCollection.updateOne.mockResolvedValueOnce({ matchedCount: 1 });

            await GestionnaireController.updateGestionnaire(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Gestionnaire mis à jour avec succès.' });
        });
    });

    /**
     * Tests for deleteGestionnaire
     */
    describe('deleteGestionnaire', () => {
        test('should return 404 if gestionnaire is not found', async () => {
            req.params.id = 'mockId';

            mockCollection.deleteOne.mockResolvedValueOnce({ deletedCount: 0 });

            await GestionnaireController.deleteGestionnaire(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Gestionnaire non trouvé.' });
        });

        test('should return 200 if gestionnaire is deleted successfully', async () => {
            req.params.id = 'mockId';

            mockCollection.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });

            await GestionnaireController.deleteGestionnaire(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Gestionnaire supprimé avec succès.' });
        });
    });
});
