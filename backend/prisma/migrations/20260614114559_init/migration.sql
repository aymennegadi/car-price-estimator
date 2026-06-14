-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estimation" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "marque" TEXT NOT NULL,
    "modele" TEXT NOT NULL,
    "annee" INTEGER NOT NULL,
    "km" INTEGER NOT NULL,
    "carburant" TEXT NOT NULL,
    "boite" TEXT NOT NULL,
    "puissance" INTEGER NOT NULL,
    "wilaya" TEXT NOT NULL,
    "prix" INTEGER NOT NULL,
    "prixMin" INTEGER NOT NULL,
    "prixMax" INTEGER NOT NULL,
    "confiance" DOUBLE PRECISION NOT NULL,
    "commentaire" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Estimation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Estimation" ADD CONSTRAINT "Estimation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
