-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "erkennungszeitpunkt" TIMESTAMP(3),
    "erkannt_durch" VARCHAR(255),
    "betroffene_systeme" TEXT[],
    "erste_erkenntnisse" TEXT,
    "incident_type" VARCHAR(50),
    "q1" INTEGER,
    "q2" INTEGER,
    "q3" INTEGER,
    "severity" VARCHAR(20),
    "playbook" JSONB,
    "regulatorische_meldungen" JSONB,
    "metadata" JSONB,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Incident_incident_type_idx" ON "Incident"("incident_type");

-- CreateIndex
CREATE INDEX "Incident_severity_idx" ON "Incident"("severity");

-- CreateIndex
CREATE INDEX "Incident_createdAt_idx" ON "Incident"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Incident_erkennungszeitpunkt_idx" ON "Incident"("erkennungszeitpunkt" DESC);
