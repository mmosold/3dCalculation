"use client"; 

import React, { useState, useMemo } from 'react';
import { Calculator, DollarSign, Droplets, Zap, Clock, Package } from 'lucide-react';

export default function ResinPrintCalculator() {
  const [inputs, setInputs] = useState({
    // Model specifications
    volumeMl: 50,
    supportVolumeMl: 10,
    printTimeHours: 8,
    failureRate: 10,
    
    // Material costs
    resinPricePerLiter: 35,
    isopropanolPricePerLiter: 15,
    ipaUsagePerPrint: 50,
    
    // Equipment costs
    printerCost: 300,
    printerLifespanPrints: 2000,
    fepFilmCost: 20,
    fepLifespanPrints: 50,
    buildPlateCost: 30,
    buildPlateLifespanPrints: 500,
    
    // Operational costs
    powerConsumptionWatts: 80,
    electricityPricePerKwh: 0.12,
    uvCuringTimeMinutes: 5,
    uvCuringWatts: 50,
    
    // Labor and overhead
    laborTimeMinutes: 30,
    laborRatePerHour: 20,
    overheadPercentage: 15
  });

  // const handleChange = (field, value) => {
  const handleChange = (field: keyof typeof inputs, value: string) => {
    setInputs(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const costs = useMemo(() => {
    const {
      volumeMl, supportVolumeMl, printTimeHours, failureRate,
      resinPricePerLiter, isopropanolPricePerLiter, ipaUsagePerPrint,
      printerCost, printerLifespanPrints, fepFilmCost, fepLifespanPrints,
      buildPlateCost, buildPlateLifespanPrints,
      powerConsumptionWatts, electricityPricePerKwh,
      uvCuringTimeMinutes, uvCuringWatts,
      laborTimeMinutes, laborRatePerHour, overheadPercentage
    } = inputs;

    // Material costs
    const totalResinMl = volumeMl + supportVolumeMl;
    const resinCost = (totalResinMl / 1000) * resinPricePerLiter;
    const ipaCost = (ipaUsagePerPrint / 1000) * isopropanolPricePerLiter;
    const materialCost = resinCost + ipaCost;

    // Equipment depreciation
    const printerDepreciation = printerCost / printerLifespanPrints;
    const fepDepreciation = fepFilmCost / fepLifespanPrints;
    const buildPlateDepreciation = buildPlateCost / buildPlateLifespanPrints;
    const equipmentCost = printerDepreciation + fepDepreciation + buildPlateDepreciation;

    // Energy costs
    const printEnergyKwh = (powerConsumptionWatts / 1000) * printTimeHours;
    const printEnergyCost = printEnergyKwh * electricityPricePerKwh;
    const uvEnergyKwh = (uvCuringWatts / 1000) * (uvCuringTimeMinutes / 60);
    const uvEnergyCost = uvEnergyKwh * electricityPricePerKwh;
    const energyCost = printEnergyCost + uvEnergyCost;

    // Labor cost
    const laborCost = (laborTimeMinutes / 60) * laborRatePerHour;

    // Subtotal before failure rate
    const subtotal = materialCost + equipmentCost + energyCost + laborCost;

    // Failure rate adjustment
    const failureAdjustment = subtotal * (failureRate / 100);

    // Total before overhead
    const totalBeforeOverhead = subtotal + failureAdjustment;

    // Overhead
    const overhead = totalBeforeOverhead * (overheadPercentage / 100);

    // Final total
    const totalCost = totalBeforeOverhead + overhead;

    return {
      resinCost,
      ipaCost,
      materialCost,
      printerDepreciation,
      fepDepreciation,
      buildPlateDepreciation,
      equipmentCost,
      printEnergyCost,
      uvEnergyCost,
      energyCost,
      laborCost,
      subtotal,
      failureAdjustment,
      totalBeforeOverhead,
      overhead,
      totalCost
    };
  }, [inputs]);

  const presets = {
    miniature: {
      name: "Міні фігурка (28мм)",
      volumeMl: 5,
      supportVolumeMl: 2,
      printTimeHours: 3,
      failureRate: 5
    },
    standard: {
      name: "Стандартна фігура (10см)",
      volumeMl: 50,
      supportVolumeMl: 10,
      printTimeHours: 8,
      failureRate: 10
    },
    large: {
      name: "Велика статуя (20см)",
      volumeMl: 200,
      supportVolumeMl: 40,
      printTimeHours: 16,
      failureRate: 15
    },
    bust: {
      name: "Детальний бюст (15см)",
      volumeMl: 120,
      supportVolumeMl: 25,
      printTimeHours: 12,
      failureRate: 12
    }
  };

  //const loadPreset = (preset) => {
  //const loadPreset = (preset: typeof inputs) => {
  const loadPreset = (preset: Partial<typeof inputs>) => {
    setInputs(prev => ({
      ...prev,
      ...preset
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Calculator className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Калькулятор вартості 3D друку смолою</h1>
          </div>
          <p className="text-purple-200">Розрахунок повної вартості друку смоляних фігур</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-300/20">
            <h2 className="text-2xl font-bold text-white mb-4">Вхідні параметри</h2>
            
            {/* Presets */}
            <div className="mb-6">
              <label className="block text-purple-200 font-semibold mb-2">Швидкі шаблони</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(presets).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => loadPreset(preset)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition text-sm"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Model Specifications */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Специфікація моделі
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-purple-200 text-sm mb-1">Об'єм моделі (мл)</label>
                  <input
                    type="number"
                    value={inputs.volumeMl}
                    onChange={(e) => handleChange('volumeMl', e.target.value)}
                    className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 text-sm mb-1">Об'єм підтримок (мл)</label>
                  <input
                    type="number"
                    value={inputs.supportVolumeMl}
                    onChange={(e) => handleChange('supportVolumeMl', e.target.value)}
                    className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 text-sm mb-1">Час друку (години)</label>
                  <input
                    type="number"
                    value={inputs.printTimeHours}
                    onChange={(e) => handleChange('printTimeHours', e.target.value)}
                    className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 text-sm mb-1">Відсоток браку (%)</label>
                  <input
                    type="number"
                    value={inputs.failureRate}
                    onChange={(e) => handleChange('failureRate', e.target.value)}
                    className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Material Costs */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
                <Droplets className="w-5 h-5" />
                Вартість матеріалів
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-purple-200 text-sm mb-1">Ціна смоли ($/літр)</label>
                  <input
                    type="number"
                    value={inputs.resinPricePerLiter}
                    onChange={(e) => handleChange('resinPricePerLiter', e.target.value)}
                    className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 text-sm mb-1">Ціна ізопропанолу ($/літр)</label>
                  <input
                    type="number"
                    value={inputs.isopropanolPricePerLiter}
                    onChange={(e) => handleChange('isopropanolPricePerLiter', e.target.value)}
                    className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 text-sm mb-1">Використання ІПС на друк (мл)</label>
                  <input
                    type="number"
                    value={inputs.ipaUsagePerPrint}
                    onChange={(e) => handleChange('ipaUsagePerPrint', e.target.value)}
                    className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Equipment Costs */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-purple-300 mb-3">Амортизація обладнання</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-purple-200 text-sm mb-1">Вартість принтера ($)</label>
                    <input
                      type="number"
                      value={inputs.printerCost}
                      onChange={(e) => handleChange('printerCost', e.target.value)}
                      className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-purple-200 text-sm mb-1">Термін служби (друків)</label>
                    <input
                      type="number"
                      value={inputs.printerLifespanPrints}
                      onChange={(e) => handleChange('printerLifespanPrints', e.target.value)}
                      className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-purple-200 text-sm mb-1">Вартість FEP плівки ($)</label>
                    <input
                      type="number"
                      value={inputs.fepFilmCost}
                      onChange={(e) => handleChange('fepFilmCost', e.target.value)}
                      className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-purple-200 text-sm mb-1">Термін служби (друків)</label>
                    <input
                      type="number"
                      value={inputs.fepLifespanPrints}
                      onChange={(e) => handleChange('fepLifespanPrints', e.target.value)}
                      className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-purple-200 text-sm mb-1">Вартість столика ($)</label>
                    <input
                      type="number"
                      value={inputs.buildPlateCost}
                      onChange={(e) => handleChange('buildPlateCost', e.target.value)}
                      className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-purple-200 text-sm mb-1">Термін служби (друків)</label>
                    <input
                      type="number"
                      value={inputs.buildPlateLifespanPrints}
                      onChange={(e) => handleChange('buildPlateLifespanPrints', e.target.value)}
                      className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Energy Costs */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Енергозатрати
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-purple-200 text-sm mb-1">Споживання енергії (Вт)</label>
                  <input
                    type="number"
                    value={inputs.powerConsumptionWatts}
                    onChange={(e) => handleChange('powerConsumptionWatts', e.target.value)}
                    className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 text-sm mb-1">Тариф електроенергії ($/кВт·год)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.electricityPricePerKwh}
                    onChange={(e) => handleChange('electricityPricePerKwh', e.target.value)}
                    className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-purple-200 text-sm mb-1">УФ-засвітка (хв)</label>
                    <input
                      type="number"
                      value={inputs.uvCuringTimeMinutes}
                      onChange={(e) => handleChange('uvCuringTimeMinutes', e.target.value)}
                      className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-purple-200 text-sm mb-1">Потужність УФ (Вт)</label>
                    <input
                      type="number"
                      value={inputs.uvCuringWatts}
                      onChange={(e) => handleChange('uvCuringWatts', e.target.value)}
                      className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Labor & Overhead */}
            <div>
              <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Робота та накладні витрати
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-purple-200 text-sm mb-1">Час роботи (хвилини)</label>
                  <input
                    type="number"
                    value={inputs.laborTimeMinutes}
                    onChange={(e) => handleChange('laborTimeMinutes', e.target.value)}
                    className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 text-sm mb-1">Ставка оплати ($/годину)</label>
                  <input
                    type="number"
                    value={inputs.laborRatePerHour}
                    onChange={(e) => handleChange('laborRatePerHour', e.target.value)}
                    className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 text-sm mb-1">Накладні витрати (%)</label>
                  <input
                    type="number"
                    value={inputs.overheadPercentage}
                    onChange={(e) => handleChange('overheadPercentage', e.target.value)}
                    className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {/* Total Cost */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">ЗАГАЛЬНА ВАРТІСТЬ ДРУКУ</p>
                  <p className="text-5xl font-bold text-white mt-2">
                    ${costs.totalCost.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="w-16 h-16 text-white/30" />
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-300/20">
              <h3 className="text-xl font-bold text-white mb-4">Деталізація витрат</h3>
              
              <div className="space-y-3">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-purple-200 font-semibold">Вартість матеріалів</span>
                    <span className="text-white font-bold">${costs.materialCost.toFixed(2)}</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-purple-300">
                      <span>Смола ({inputs.volumeMl + inputs.supportVolumeMl}мл)</span>
                      <span>${costs.resinCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-purple-300">
                      <span>ІПС ({inputs.ipaUsagePerPrint}мл)</span>
                      <span>${costs.ipaCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-purple-200 font-semibold">Амортизація обладнання</span>
                    <span className="text-white font-bold">${costs.equipmentCost.toFixed(2)}</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-purple-300">
                      <span>Принтер</span>
                      <span>${costs.printerDepreciation.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-purple-300">
                      <span>FEP плівка</span>
                      <span>${costs.fepDepreciation.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-purple-300">
                      <span>Столик</span>
                      <span>${costs.buildPlateDepreciation.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-purple-200 font-semibold">Енергозатрати</span>
                    <span className="text-white font-bold">${costs.energyCost.toFixed(2)}</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-purple-300">
                      <span>Друк ({inputs.printTimeHours}год)</span>
                      <span>${costs.printEnergyCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-purple-300">
                      <span>УФ-засвітка ({inputs.uvCuringTimeMinutes}хв)</span>
                      <span>${costs.uvEnergyCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-200 font-semibold">Робота</span>
                    <span className="text-white font-bold">${costs.laborCost.toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-purple-300 mt-1">
                    {inputs.laborTimeMinutes} хвилин @ ${inputs.laborRatePerHour}/год
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-200 font-semibold">Коригування на брак</span>
                    <span className="text-white font-bold">${costs.failureAdjustment.toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-purple-300 mt-1">
                    {inputs.failureRate}% від проміжної суми
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-200 font-semibold">Накладні витрати</span>
                    <span className="text-white font-bold">${costs.overhead.toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-purple-300 mt-1">
                    {inputs.overheadPercentage}% (оренда, комунальні послуги тощо)
                  </div>
                </div>
              </div>
            </div>

            {/* Per Unit Analysis */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-300/20">
              <h3 className="text-xl font-bold text-white mb-4">Аналіз витрат</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-200">Вартість за мл смоли</span>
                  <span className="text-white font-semibold">
                    ${(costs.totalCost / (inputs.volumeMl + inputs.supportVolumeMl)).toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Вартість за годину друку</span>
                  <span className="text-white font-semibold">
                    ${(costs.totalCost / inputs.printTimeHours).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Матеріали від загальної вартості</span>
                  <span className="text-white font-semibold">
                    {((costs.materialCost / costs.totalCost) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}